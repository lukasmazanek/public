/**
 * BKB Explorer - Main Application
 *
 * Entry point for the Business Knowledge Base Explorer.
 * Initializes all components and manages global state.
 */

const BKBExplorer = {
    // Current state
    state: {
        currentDomain: null,  // Currently loaded domain name
        currentDomainPath: null,  // Currently loaded domain path (for lazy loading)
        currentView: null,  // Active view filter (null = all)
        expandedNodes: new Set(),
        selectedNode: null,
        // CST element visibility toggles (all default ON, except transitive)
        show: {
            domain: true,
            fibo: true,
            schema: true,
            context: true,
            categorizations: true,
            relationships: true,
            orphans: true,
            transitive: false,  // ADR-048: Off by default
            primitive: false    // Primitive types (String, Integer) - off by default
        },
        layout: 'dagre'
    },

    // Lazy loading cache
    _loadedDomains: {},  // path -> data
    _loadingScripts: {}, // path -> Promise

    /**
     * Initialize the application
     */
    async init() {
        console.log('🏦 BKB Explorer initializing...');

        // Load domains hierarchy (lazy loading - only structure, not data)
        try {
            const domainsData = await this.loadDomainsHierarchy();
            window.BKB_DOMAINS = domainsData;
        } catch (error) {
            console.error('❌ Failed to load domains hierarchy:', error);
            this.showError('Failed to load domains. Run ./js/generate-hierarchy.js first.');
            return;
        }

        // Initialize components
        Sidebar.init(window.BKB_DOMAINS);
        Graph.init('graph-container');
        Tooltip.init();
        this.setupLegendToggle();

        // Set up event listeners
        this.setupEventListeners();

        // Load default domain (first actual domain in hierarchy, skip folders)
        const firstDomainPath = this.findFirstDomain(window.BKB_DOMAINS.hierarchy);
        if (firstDomainPath) {
            console.log(`📍 Auto-loading first domain: ${firstDomainPath}`);
            await this.selectDomainByPath(firstDomainPath);
        }

        console.log('✅ BKB Explorer ready');
    },

    /**
     * Find first actual domain (type === 'domain') in hierarchy, recursively
     * @param {Object} hierarchy - Hierarchy object
     * @returns {string|null} Path to first domain, or null if none found
     */
    findFirstDomain(hierarchy) {
        for (const [name, node] of Object.entries(hierarchy)) {
            if (node.type === 'domain') {
                return node.path;
            }
            // Recurse into children (folders or domains with subdomains)
            if (node.children) {
                const found = this.findFirstDomain(node.children);
                if (found) return found;
            }
        }
        return null;
    },

    /**
     * Load domains hierarchy from output/domains.js
     * @returns {Promise<Object>} Domains hierarchy
     */
    async loadDomainsHierarchy() {
        // Load via script tag (works with file:// protocol)
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'output/domains.js';
            script.id = 'domains-hierarchy';

            script.onload = () => {
                if (window.BKB_DOMAINS_DATA) {
                    resolve(window.BKB_DOMAINS_DATA);
                    delete window.BKB_DOMAINS_DATA; // Clean up global
                } else {
                    reject(new Error('Invalid domains.js format'));
                }
            };

            script.onerror = () => {
                reject(new Error('domains.js not found. Run: node js/generate-hierarchy.js'));
            };

            document.head.appendChild(script);
        });
    },

    /**
     * Load domain data dynamically (lazy loading)
     * @param {string} path - Domain path (e.g., "Test/Order" or "RBCZ/MIB/Investment")
     * @returns {Promise<Object>} Domain data
     */
    async loadDomainData(path) {
        console.log(`📥 loadDomainData called with path: "${path}"`);

        // Check cache first
        if (this._loadedDomains[path]) {
            console.log(`✅ Using cached data for ${path}`);
            return this._loadedDomains[path];
        }

        // Check if already loading
        if (this._loadingScripts[path]) {
            console.log(`⏳ Already loading ${path}, returning existing promise`);
            return this._loadingScripts[path];
        }

        // Use script tag for file:// compatibility, fetch for HTTP
        const scriptSrc = `js/${path}/data.js`;
        const isFileProtocol = window.location.protocol === 'file:';

        console.log(`📜 Loading ${isFileProtocol ? 'via <script>' : 'via fetch'}: ${scriptSrc}`);

        const self = this;
        let promise;

        if (isFileProtocol) {
            // Use script tag for file:// protocol
            promise = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = scriptSrc;
                script.async = true; // Ensure async loading

                script.onload = function() {
                    console.log(`✅ Script loaded: ${scriptSrc}`);
                    if (window.BKB_LOADED) {
                        const data = window.BKB_LOADED;
                        console.log(`✅ Data loaded for ${path}, concepts: ${data.concepts?.length || 0}`);
                        self._loadedDomains[path] = data;
                        delete window.BKB_LOADED;
                        delete self._loadingScripts[path];
                        resolve(data);
                    } else {
                        reject(new Error(`BKB_LOADED not found for ${path}`));
                    }
                };

                script.onerror = function() {
                    reject(new Error(`Failed to load ${scriptSrc}`));
                };

                document.head.appendChild(script);
            });
        } else {
            // Use fetch for HTTP protocol
            promise = fetch(scriptSrc)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response.text();
                })
                .then(scriptText => {
                    eval(scriptText);
                    if (window.BKB_LOADED) {
                        const data = window.BKB_LOADED;
                        console.log(`✅ Data loaded for ${path}, concepts: ${data.concepts?.length || 0}`);
                        self._loadedDomains[path] = data;
                        delete window.BKB_LOADED;
                        delete self._loadingScripts[path];
                        return data;
                    } else {
                        throw new Error(`BKB_LOADED not found for ${path}`);
                    }
                })
                .catch(error => {
                    console.error(`❌ Failed to load ${scriptSrc}:`, error);
                    delete self._loadingScripts[path];
                    throw error;
                });
        }

        this._loadingScripts[path] = promise;
        return promise;
    },

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Mobile sidebar toggle
        this.setupMobileMenu();

        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // CST element toggles
        const toggles = ['domain', 'fibo', 'schema', 'context', 'categorizations', 'relationships', 'orphans', 'transitive', 'primitive'];
        toggles.forEach(toggle => {
            const input = document.getElementById(`show-${toggle}`);
            if (input) {
                input.addEventListener('change', (e) => {
                    this.state.show[toggle] = e.target.checked;
                    this.applyFilter();
                });
            }
        });

        // Layout selector
        const layoutSelect = document.getElementById('layout-select');
        if (layoutSelect) {
            layoutSelect.addEventListener('change', (e) => {
                this.state.layout = e.target.value;
                Graph.setLayout(this.state.layout);
            });
        }

        // View filter selector
        const viewSelect = document.getElementById('view-select');
        if (viewSelect) {
            viewSelect.addEventListener('change', (e) => {
                const viewId = e.target.value || null;
                this.selectView(viewId);
                // Also update sidebar view selection
                if (this.state.currentDomain) {
                    Sidebar.selectView(viewId, this.state.currentDomain);
                }
            });
        }
    },

    /**
     * Select a domain to display (lazy loading)
     * @param {string} domainName - Domain name (e.g., "Test")
     * @param {string} [viewName] - Optional view name (e.g., "Order")
     */
    async selectDomain(domainName, viewName) {
        console.log(`📂 Selecting domain: ${domainName}${viewName ? ` (view: ${viewName})` : ''}`);

        this.state.currentDomain = domainName;
        this.state.currentView = viewName || null;
        this.state.expandedNodes.clear();

        // Resolve domain path from hierarchy
        const domainPath = this.resolveDomainPath(domainName, viewName);
        if (!domainPath) {
            console.error(`❌ Domain path not found for: ${domainName}${viewName ? '/' + viewName : ''}`);
            return;
        }

        // Load domain data dynamically
        let domainData;
        try {
            domainData = await this.loadDomainData(domainPath);
        } catch (error) {
            console.error(`❌ Failed to load data for ${domainPath}:`, error);
            this.showError(`Failed to load domain data. Check console for details.`);
            return;
        }

        // Update sidebar
        if (viewName) {
            // BUG-039 FIX: Pass domainPath for unique identification
            Sidebar.setActiveView(domainName, viewName, domainPath);
        } else {
            Sidebar.setActive(domainName);
        }

        // Extract views for filtering and render in sidebar
        Views.extractViews(domainData);
        const viewsList = Views.getViewsList();

        // Render views dynamically in sidebar
        // BUG-014 FIX: Use domainPath instead of name (handles duplicate domain names)
        Sidebar.renderDomainViews(domainPath, viewsList);

        // Update view filter dropdown
        this.updateViewDropdown(viewsList);

        // Update breadcrumb
        this.updateBreadcrumb(domainData.domain.path);

        // Load graph
        Graph.loadDomain(domainData);

        // Update filter counts
        this.updateFilterCounts();

        // Reapply current filter
        this.applyFilter();

        // Close mobile sidebar after selection
        if (this.closeMobileSidebar && window.innerWidth <= 768) {
            this.closeMobileSidebar();
        }
    },

    /**
     * Select a domain by filesystem path (used by sidebar path-based navigation)
     * @param {string} path - Filesystem path (e.g., "RBCZ/MIB/Investment" or "Test/Order")
     */
    async selectDomainByPath(path) {
        console.log(`📂 Selecting domain by path: ${path}`);

        // Extract domain name from path (last component)
        const pathParts = path.split('/');
        const domainName = pathParts[pathParts.length - 1];
        console.log(`📌 Domain name: ${domainName}`);

        this.state.currentDomain = domainName;
        this.state.currentDomainPath = path;
        this.state.currentView = null;
        this.state.expandedNodes.clear();

        // Load domain data dynamically
        let domainData;
        try {
            console.log(`🔄 Loading data for path: ${path}`);
            domainData = await this.loadDomainData(path);
            console.log(`✅ Data loaded:`, {
                domain: domainData.domain.name,
                concepts: domainData.concepts?.length || 0,
                relationships: domainData.relationships?.length || 0
            });
        } catch (error) {
            console.error(`❌ Failed to load data for ${path}:`, error);
            this.showError(`Failed to load domain data. Check console for details.`);
            return;
        }

        // Extract views for filtering and render in sidebar
        console.log(`🔍 Extracting views...`);
        Views.extractViews(domainData);
        const viewsList = Views.getViewsList();
        console.log(`📋 Views found: ${viewsList.length}`);

        // Render views dynamically in sidebar
        // BUG-014 FIX: Use path instead of name (handles duplicate domain names)
        Sidebar.renderDomainViews(path, viewsList);

        // Update view filter dropdown
        this.updateViewDropdown(viewsList);

        // Update breadcrumb
        console.log(`🍞 Updating breadcrumb: ${domainData.domain.path}`);
        this.updateBreadcrumb(domainData.domain.path);

        // Load graph
        console.log(`📊 Loading graph...`);
        Graph.loadDomain(domainData);

        // Update filter counts
        console.log(`🔢 Updating filter counts...`);
        this.updateFilterCounts();

        // Reapply current filter
        console.log(`🎯 Applying filters...`);
        this.applyFilter();

        console.log(`✅ Domain ${domainName} loaded successfully`);

        // Close mobile sidebar after selection
        if (this.closeMobileSidebar && window.innerWidth <= 768) {
            this.closeMobileSidebar();
        }
    },

    /**
     * Resolve domain path from hierarchy
     * @param {string} domainName - Domain name
     * @param {string} [viewName] - Optional view name
     * @returns {string|null} Filesystem path (e.g., "Test/Order")
     */
    resolveDomainPath(domainName, viewName) {
        if (!window.BKB_DOMAINS || !window.BKB_DOMAINS.hierarchy) {
            return null;
        }

        // Navigate hierarchy to find domain
        function findInHierarchy(node, name) {
            if (node[name]) {
                return node[name];
            }
            // Search in children
            for (const [key, value] of Object.entries(node)) {
                if (value.children) {
                    const found = findInHierarchy(value.children, name);
                    if (found) return found;
                }
            }
            return null;
        }

        const domainNode = findInHierarchy(window.BKB_DOMAINS.hierarchy, domainName);
        if (!domainNode) return null;

        // If view specified, get view path
        if (viewName && domainNode.views && domainNode.views[viewName]) {
            return domainNode.views[viewName].path;
        }

        // Return domain path
        return domainNode.path;
    },

    /**
     * Select a view within the current domain
     * @param {string|null} viewId - View ID or null for all
     */
    selectView(viewId) {
        console.log(`📋 Selecting view: ${viewId || 'All'}`);

        this.state.currentView = viewId;
        Views.setActiveView(viewId);

        // Sync view dropdown
        const viewSelect = document.getElementById('view-select');
        if (viewSelect) {
            viewSelect.value = viewId || '';
        }

        // Update breadcrumb to show view
        const domainPath = this.state.currentDomainPath;
        const domainData = domainPath ? this._loadedDomains[domainPath] : null;
        if (domainData) {
            const viewInfo = viewId ? Views.viewsMap.get(viewId) : null;
            const path = viewInfo
                ? `${domainData.domain.path} › ${viewInfo.name}`
                : domainData.domain.path;
            this.updateBreadcrumb(path);
        }

        // Rebuild graph with filtered data (view filter applied at source)
        if (domainData) {
            Graph.loadDomain(domainData);
            this.updateFilterCounts();
        }
        this.applyFilter();
    },

    /**
     * Update the view dropdown with current views
     * @param {Array} views - Array of { id, name, conceptCount }
     */
    updateViewDropdown(views) {
        const container = document.getElementById('view-filter-container');
        const select = document.getElementById('view-select');
        if (!container || !select) return;

        // Show/hide based on whether there are views
        if (views.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = '';

        // Rebuild options
        select.innerHTML = '<option value="">All concepts</option>';
        views.forEach(view => {
            const option = document.createElement('option');
            option.value = view.id;
            option.textContent = `${view.name} (${view.conceptCount})`;
            select.appendChild(option);
        });

        // Reset to "All"
        select.value = '';
    },

    /**
     * Update filter count labels
     */
    updateFilterCounts() {
        const counts = Graph.getFilterCounts();

        document.getElementById('count-domain').textContent = `(${counts.domain})`;
        document.getElementById('count-fibo').textContent = `(${counts.fibo})`;
        document.getElementById('count-schema').textContent = `(${counts.schema})`;
        document.getElementById('count-orphans').textContent = `(${counts.orphans})`;
        document.getElementById('count-context').textContent = `(${counts.context})`;
        document.getElementById('count-categorizations').textContent = `(${counts.categorizations})`;
        document.getElementById('count-relationships').textContent = `(${counts.relationships})`;
        document.getElementById('count-transitive').textContent = `(${counts.transitive})`;
        document.getElementById('count-primitive').textContent = `(${counts.primitive})`;
    },

    /**
     * Update breadcrumb navigation
     */
    updateBreadcrumb(path) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;

        const parts = path.split(':');
        breadcrumb.innerHTML = parts.map((part, index) => {
            const isLast = index === parts.length - 1;
            const separator = index < parts.length - 1
                ? '<span class="breadcrumb-separator">›</span>'
                : '';
            return `<span class="breadcrumb-item ${isLast ? 'active' : ''}">${part}</span>${separator}`;
        }).join('');
    },

    /**
     * Handle search input
     */
    handleSearch(query) {
        if (!query || query.length < 2) {
            Graph.clearHighlight();
            return;
        }

        Graph.highlightSearch(query);
    },

    /**
     * Apply current filter
     */
    applyFilter() {
        Graph.applyFilter(this.state.show);
        // Update counts after filter (orphan count depends on visible edges)
        this.updateFilterCounts();
    },

    /**
     * Navigate to another domain via portal
     */
    portal(targetDomain, focusNode) {
        console.log(`🚀 Portal to ${targetDomain}, focus: ${focusNode}`);
        this.selectDomain(targetDomain);

        // Focus on the node after a short delay (for graph to load)
        setTimeout(() => {
            Graph.focusNode(focusNode);
        }, 300);
    },

    /**
     * Set up legend toggle (collapsible)
     */
    setupLegendToggle() {
        const legend = document.getElementById('legend');
        const toggle = document.getElementById('legend-toggle');
        if (legend && toggle) {
            toggle.addEventListener('click', () => {
                legend.classList.toggle('expanded');
                toggle.textContent = legend.classList.contains('expanded')
                    ? '▼ BKB Notation'
                    : '▶ BKB Notation';
            });
        }
    },

    /**
     * Set up mobile menu (hamburger toggle)
     */
    setupMobileMenu() {
        const menuBtn = document.getElementById('mobile-menu-btn');
        const closeBtn = document.getElementById('sidebar-close-btn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        const openSidebar = () => {
            sidebar.classList.add('open');
            overlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
        };

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('visible');
            document.body.style.overflow = '';
        };

        if (menuBtn) {
            menuBtn.addEventListener('click', openSidebar);
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeSidebar);
        }

        if (overlay) {
            overlay.addEventListener('click', closeSidebar);
        }

        // Close sidebar when domain is selected (mobile)
        this.closeMobileSidebar = closeSidebar;
    },

    /**
     * Show error message
     */
    showError(message) {
        const container = document.getElementById('graph-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <h2>❌ Error</h2>
                    <p>${message}</p>
                </div>
            `;
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    BKBExplorer.init();
});

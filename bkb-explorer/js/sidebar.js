/**
 * BKB Explorer - Sidebar Component
 *
 * Handles domain tree navigation with View support (ADR-040).
 */

const Sidebar = {
    container: null,
    domainsData: null,
    viewsEnabled: true,  // Show views under domains

    /**
     * Initialize sidebar with domain hierarchy
     */
    init(domainsData) {
        this.container = document.getElementById('domain-tree');
        this.domainsData = domainsData;

        if (!this.container) {
            console.error('❌ Sidebar container not found');
            return;
        }

        this.render();
        console.log('📁 Sidebar initialized');
    },

    /**
     * Render domain tree
     */
    render() {
        if (!this.domainsData || !this.domainsData.hierarchy) {
            this.container.innerHTML = '<div class="empty-state">No domains loaded</div>';
            return;
        }

        const html = this.renderHierarchy(this.domainsData.hierarchy, 0);
        this.container.innerHTML = html;

        // Add click handlers
        this.container.querySelectorAll('.tree-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                // Check if click was on the icon
                const clickedOnIcon = e.target.classList.contains('icon');
                this.handleClick(item, clickedOnIcon);
            });
        });

        // Expand all top-level domains by default (shows views underneath)
        for (const name of Object.keys(this.domainsData.hierarchy)) {
            this.expandNode(name);
            const node = this.domainsData.hierarchy[name];
            // Also expand child domains (not views - those are already visible)
            if (node.children) {
                for (const childName of Object.keys(node.children)) {
                    this.expandNode(childName);
                }
            }
        }
    },

    /**
     * Get concept count from hierarchy (no data loading needed)
     * @param {Object} nodeData - Hierarchy node data
     * @returns {number} Total concept count
     */
    getConceptCount(nodeData) {
        if (!nodeData) return 0;

        // If node has conceptCount, return it
        if (nodeData.conceptCount !== undefined) {
            return nodeData.conceptCount;
        }

        // If domain has views, sum up view counts
        if (nodeData.views) {
            let total = 0;
            for (const viewData of Object.values(nodeData.views)) {
                total += viewData.conceptCount || 0;
            }
            return total;
        }

        return 0;
    },

    /**
     * Render hierarchy recursively
     * ADR-040: Views are perspectives within domains, NOT subdomains
     * @param {Object} node - Current hierarchy node
     * @param {number} depth - Nesting depth
     * @param {string} parentPath - Full path to parent (e.g., "RBCZ:MIB")
     */
    renderHierarchy(node, depth, parentPath = '') {
        let html = '';

        // Sort: Test always last, others alphabetically (ADR-041)
        const entries = Object.entries(node).sort(([a], [b]) => {
            if (a === 'Test') return 1;
            if (b === 'Test') return -1;
            return a.localeCompare(b);
        });

        for (const [name, data] of entries) {
            const hasChildren = data.children && Object.keys(data.children).length > 0;
            const hasViews = data.views && Object.keys(data.views).length > 0;
            const isClickable = data.type === 'domain';
            // Get concept count from hierarchy (no data loading)
            const conceptCount = this.getConceptCount(data);

            // Build full path for this node (e.g., "RBCZ:MIB:Investment")
            const fullPath = parentPath ? `${parentPath}:${name}` : name;

            // Determine icon: domains/folders use triangles (▶/▼), views use diamonds (◇/◆)
            let icon = '▶';  // All domains/folders start collapsed with ▶

            // Count display
            const countDisplay = conceptCount > 0 ? `(${conceptCount})` : '';

            html += `
                <div class="tree-item"
                     data-name="${name}"
                     data-path="${data.path || ''}"
                     data-type="${data.type || 'folder'}"
                     data-depth="${depth}"
                     data-clickable="${isClickable}">
                    <span class="icon">${icon}</span>
                    <span class="label">${name}</span>
                    <span class="count">${countDisplay}</span>
                </div>
            `;

            // Render child domains (subdomains)
            if (hasChildren) {
                html += `<div class="tree-children collapsed" data-parent="${name}">`;
                html += this.renderHierarchy(data.children, depth + 1, fullPath);
                html += '</div>';
            }

            // Render views (NOT subdomains - just perspectives within the domain)
            if (hasViews) {
                html += `<div class="tree-children views-list collapsed" data-parent="${name}">`;
                // Sort views alphabetically (ADR-041)
                const viewEntries = Object.entries(data.views).sort(([a], [b]) => a.localeCompare(b));
                for (const [viewName, viewData] of viewEntries) {
                    // Get count from hierarchy (no data loading)
                    const viewCount = viewData.conceptCount || 0;
                    // Transform view ID to display name (e.g., "FinancialAccount" → "Financial Account")
                    const displayName = Views.viewIdToName(viewName);
                    // BUG-016 FIX: Store filesystem path for cross-domain view navigation
                    const domainFsPath = data.path || '';
                    html += `
                        <div class="tree-item view-item"
                             data-name="${viewName}"
                             data-type="view"
                             data-domain="${name}"
                             data-domain-path="${domainFsPath}"
                             data-depth="${depth + 1}"
                             data-clickable="true">
                            <span class="icon">◇</span>
                            <span class="label">${displayName}</span>
                            <span class="count">(${viewCount})</span>
                        </div>
                    `;
                }
                html += '</div>';
            }
        }

        return html;
    },

    /**
     * Expand a node by name
     */
    expandNode(name) {
        const children = this.container.querySelector(`.tree-children[data-parent="${name}"]`);
        if (children) {
            children.classList.remove('collapsed');
            const item = this.container.querySelector(`.tree-item[data-name="${name}"]`);
            if (item) {
                const icon = item.querySelector('.icon');
                if (icon) {
                    icon.textContent = '▼';
                }
            }
        }
    },

    /**
     * Render views dynamically after domain data is loaded
     * BUG-014 FIX: Use path for unique identification (not name, which can be duplicate)
     * @param {string} domainPath - Domain filesystem path (e.g., "RBCZ/MIB/Investment")
     * @param {Array} viewsList - Array of {id, name, conceptCount}
     */
    renderDomainViews(domainPath, viewsList) {
        // BUG-014 FIX: Find by path instead of name to handle duplicate names
        const domainItem = this.container.querySelector(`.tree-item[data-path="${domainPath}"][data-type="domain"]`);
        if (!domainItem) {
            console.warn(`Domain item not found for path: ${domainPath}`);
            return;
        }

        const domainName = domainItem.dataset.name;

        // Remove existing views container if any
        const existingViews = domainItem.parentElement.querySelector(`.tree-children.views-list[data-parent="${domainName}"]`);
        if (existingViews) {
            existingViews.remove();
        }

        // Don't render if no views
        if (!viewsList || viewsList.length === 0) {
            return;
        }

        // Create views container
        // BUG-016 FIX: Store domain path for cross-domain view navigation
        const viewsHtml = viewsList.map(view => `
            <div class="tree-item view-item"
                 data-name="${view.id}"
                 data-type="view"
                 data-domain="${domainName}"
                 data-domain-path="${domainPath}"
                 data-depth="${parseInt(domainItem.dataset.depth) + 1}"
                 data-clickable="true">
                <span class="icon">◇</span>
                <span class="label">${view.name}</span>
                <span class="count">(${view.conceptCount})</span>
            </div>
        `).join('');

        const viewsContainer = document.createElement('div');
        viewsContainer.className = 'tree-children views-list';
        viewsContainer.dataset.parent = domainName;
        viewsContainer.innerHTML = viewsHtml;

        // Insert after domain item
        domainItem.insertAdjacentElement('afterend', viewsContainer);

        // Add click handlers to view items
        // BUG-016 FIX: Check if correct domain is loaded before selecting view
        const self = this;
        viewsContainer.querySelectorAll('.view-item').forEach(viewItem => {
            viewItem.addEventListener('click', async () => {
                const viewId = viewItem.dataset.name;
                const viewDomainPath = viewItem.dataset.domainPath;
                const viewDomainName = viewItem.dataset.domain;

                console.log(`🔷 View clicked: ${viewId} in domain ${viewDomainName}, path: ${viewDomainPath}`);

                // Load domain first if different from current
                if (viewDomainPath && BKBExplorer.state.currentDomainPath !== viewDomainPath) {
                    console.log(`📂 Loading domain ${viewDomainPath} before selecting view`);
                    await BKBExplorer.selectDomainByPath(viewDomainPath);
                }

                BKBExplorer.selectView(viewId);
                self.setActiveView(viewDomainName, viewId);
            });
        });

        console.log(`📋 Rendered ${viewsList.length} views for ${domainName}`);
    },

    /**
     * Handle tree item click
     * @param {HTMLElement} item - The clicked tree item
     * @param {boolean} clickedOnIcon - True if click was on the expand/collapse icon
     */
    handleClick(item, clickedOnIcon = false) {
        const name = item.dataset.name;
        const type = item.dataset.type;
        const path = item.dataset.path;  // Filesystem path

        // Handle domain click - load data
        if (type === 'domain') {
            const children = this.container.querySelector(`.tree-children[data-parent="${name}"]`);

            if (clickedOnIcon && children) {
                // Click on icon = only toggle expand/collapse
                const isCollapsed = children.classList.contains('collapsed');
                children.classList.toggle('collapsed');
                const icon = item.querySelector('.icon');
                if (icon) icon.textContent = isCollapsed ? '▼' : '▶';
                return;
            }

            // Click on text = load domain data
            if (children) {
                // Ensure expanded when loading
                if (children.classList.contains('collapsed')) {
                    children.classList.remove('collapsed');
                    const icon = item.querySelector('.icon');
                    if (icon) icon.textContent = '▼';
                }
            }

            // Load domain using path
            BKBExplorer.selectDomainByPath(path);
            this.setActive(name);
            return;
        }

        // BUG-016 FIX: Handle view click from hierarchy-rendered views
        if (type === 'view') {
            const viewId = name;
            const domainPath = item.dataset.domainPath;  // Filesystem path stored on view
            const domainName = item.dataset.domain;  // Domain name for sidebar UI

            console.log(`🔷 View clicked (hierarchy): ${viewId} in domain ${domainName}, path: ${domainPath}`);

            // Load domain first if needed, then select view
            if (domainPath && BKBExplorer.state.currentDomainPath !== domainPath) {
                console.log(`📂 Loading domain ${domainPath} before selecting view`);
                BKBExplorer.selectDomainByPath(domainPath).then(() => {
                    BKBExplorer.selectView(viewId);
                    this.setActiveView(domainName, viewId);
                });
            } else {
                BKBExplorer.selectView(viewId);
                this.setActiveView(domainName, viewId);
            }
            return;
        }

        // Toggle children visibility for folders
        const children = this.container.querySelector(`.tree-children[data-parent="${name}"]`);
        if (children) {
            const isCollapsed = children.classList.contains('collapsed');
            children.classList.toggle('collapsed');
            const icon = item.querySelector('.icon');
            if (icon) icon.textContent = isCollapsed ? '▼' : '▶';
        }
    },

    /**
     * Set active view in sidebar
     */
    setActiveView(domainName, viewName) {
        console.log(`🔷 setActiveView called: domain=${domainName}, view=${viewName}`);

        // Clear all active states
        this.container.querySelectorAll('.tree-item.active').forEach(item => {
            item.classList.remove('active');
            const icon = item.querySelector('.icon');
            if (icon) {
                if (item.dataset.type === 'view') {
                    icon.textContent = '◇';
                }
                // Domain icons stay as ▼ (don't reset to ○)
            }
        });

        // Ensure domain is expanded (▼ icon)
        const domainItem = this.container.querySelector(`.tree-item[data-name="${domainName}"][data-type="domain"]`);
        if (domainItem) {
            const icon = domainItem.querySelector('.icon');
            if (icon) icon.textContent = '▼';
            // Ensure views list is expanded
            const viewsList = this.container.querySelector(`.tree-children.views-list[data-parent="${domainName}"]`);
            if (viewsList) viewsList.classList.remove('collapsed');
        }

        // Set view as active
        const selector = `.tree-item.view-item[data-name="${viewName}"][data-domain="${domainName}"]`;
        console.log(`🔍 Looking for view with selector: ${selector}`);
        const viewItem = this.container.querySelector(selector);
        if (viewItem) {
            console.log(`✅ View item found, marking as active`);
            viewItem.classList.add('active');
            viewItem.querySelector('.icon').textContent = '◆';
        } else {
            console.warn(`❌ View item NOT found for selector: ${selector}`);
        }
    },

    /**
     * Set active domain in sidebar
     */
    setActive(domainName) {
        // Remove previous active
        this.container.querySelectorAll('.tree-item.active').forEach(item => {
            item.classList.remove('active');
            const icon = item.querySelector('.icon');
            if (icon) {
                // Reset view icons (◆→◇)
                if (item.classList.contains('view-item')) {
                    icon.textContent = '◇';
                }
                // Domain icons stay as ▶/▼ based on collapsed state
            }
        });

        // Remove previous view items
        this.container.querySelectorAll('.views-container').forEach(el => el.remove());

        // Set new active
        const item = this.container.querySelector(`.tree-item[data-name="${domainName}"]`);
        if (item) {
            item.classList.add('active');
            // Domain icons always use ▶/▼ (no special icon for active/leaf domains)
            // Selection shown via CSS class, not icon change

            // Expand parent folders
            let parent = item.parentElement;
            while (parent) {
                if (parent.classList.contains('tree-children')) {
                    parent.classList.remove('collapsed');
                    const parentName = parent.dataset.parent;
                    const parentItem = this.container.querySelector(`.tree-item[data-name="${parentName}"]`);
                    if (parentItem) {
                        parentItem.querySelector('.icon').textContent = '▼';
                    }
                }
                parent = parent.parentElement;
            }
        }
    },

    /**
     * Select a view (called from dropdown)
     * @param {string|null} viewId - View ID or null for all
     * @param {string} domainName - Domain name
     */
    selectView(viewId, domainName) {
        console.log(`🔷 selectView called: viewId=${viewId}, domain=${domainName}`);

        if (viewId) {
            // Selecting a specific view - use setActiveView
            this.setActiveView(domainName, viewId);
        } else {
            // Deselecting view (show all) - clear all view selections
            this.container.querySelectorAll('.tree-item.view-item.active').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.icon').textContent = '◇';
            });
        }

        // Notify app
        BKBExplorer.selectView(viewId);
    }
};

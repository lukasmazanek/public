/**
 * BKB Explorer - Views Component
 *
 * Handles View abstraction per ADR-040.
 * Views are derived from sources[].file - they are virtual (no data copy).
 *
 * Rules:
 * - ID = filename without extension (e.g., "Investment_Order")
 * - Name = ID with _ replaced by space (e.g., "Investment Order")
 * - Shared membership: concept can be in multiple Views
 * - Within domain scope only
 * - Flat structure (no nested Views)
 * - Technical markers (e.g., "cross-domain-reference") are NOT views
 */

const Views = {
    /**
     * Technical markers that should NOT create views (BUG-038)
     * These are internal pipeline markers, not real source files
     */
    TECHNICAL_MARKERS: [
        'cross-domain-reference',  // Cross-domain inheritance source (hierarchy_agent.py)
    ],

    /**
     * Current domain's views
     * Structure: Map<viewId, { id, name, conceptQnames: Set<string> }>
     * BUG-009: Changed from conceptNames to conceptQnames to avoid name collisions
     */
    viewsMap: new Map(),

    /**
     * Reverse mapping: concept qname -> Set of view IDs
     * BUG-009: Changed key from name to qname for unique identification
     */
    conceptToViews: new Map(),

    /**
     * Currently active view (null = show all)
     */
    activeView: null,

    /**
     * Extract views from domain data
     * @param {Object} domainData - Domain data with concepts array
     * @returns {Map} Map of viewId -> { id, name, conceptNames }
     */
    extractViews(domainData) {
        this.viewsMap.clear();
        this.conceptToViews.clear();
        this.activeView = null;

        const concepts = domainData.concepts || [];
        // ADR-044: External concepts inherit View membership from referencing concepts
        const externalConcepts = domainData.external_concepts || [];

        // Process all concepts (domain + external)
        const allConcepts = [...concepts, ...externalConcepts];

        allConcepts.forEach(concept => {
            const sources = concept.sources || [];

            sources.forEach(source => {
                const file = source.file || '';
                // BUG-038 FIX: Skip empty files and technical markers
                if (!file || this.TECHNICAL_MARKERS.includes(file)) return;

                // BUG-040 FIX: Skip temp file paths (e.g., output/.../temp/File.cs)
                if (file.includes('.temp/') || file.startsWith('output/')) return;

                // Extract view ID from filename (remove extension)
                const viewId = this.fileToViewId(file);
                const viewName = this.viewIdToName(viewId);

                // Create or update view
                if (!this.viewsMap.has(viewId)) {
                    this.viewsMap.set(viewId, {
                        id: viewId,
                        name: viewName,
                        conceptQnames: new Set()
                    });
                }

                // BUG-009: Use qname for unique identification (not name)
                const conceptQname = concept.qname || concept.name;

                // Add concept to view
                this.viewsMap.get(viewId).conceptQnames.add(conceptQname);

                // Add reverse mapping (by qname)
                if (!this.conceptToViews.has(conceptQname)) {
                    this.conceptToViews.set(conceptQname, new Set());
                }
                this.conceptToViews.get(conceptQname).add(viewId);
            });
        });

        console.log(`📋 Extracted ${this.viewsMap.size} views from domain (${concepts.length} concepts + ${externalConcepts.length} external)`);
        return this.viewsMap;
    },

    /**
     * Convert filename to view ID
     * Supports two formats:
     * 1. Fragment notation: "RBCZ:MIB:Investment#Financial Account" → "Financial Account"
     * 2. Legacy filename: "Investment_Order.cs" → "Order"
     * @param {string} file - Filename or domain#view notation
     * @returns {string} View ID
     */
    fileToViewId(file) {
        // Check for fragment notation: "domain:path#ViewName"
        if (file.includes('#')) {
            return file.split('#')[1];
        }

        // Legacy: Remove path if present
        const filename = file.split('/').pop();
        // BUG-012 FIX: Only remove known file extensions, preserve decimal numbers
        // BUG-042 FIX: Added .test extension (ConceptSpeak golden test files)
        let viewId = filename.replace(/\.(json|cs|yaml|yml|test)$/i, '');

        // Strip common prefixes (only first match)
        const prefixes = [
            /^allininvestment[_-]/i,
            /^investment[_-]/i,
            /^financial[_-]/i,
            /^conceptspeak-training-/i,  // BUG-012: Training diagrams prefix
        ];
        for (const prefix of prefixes) {
            if (prefix.test(viewId)) {
                viewId = viewId.replace(prefix, '');
                break;  // Only remove first matching prefix
            }
        }

        // BUG-044 FIX: Normalize viewId by removing spaces to merge
        // "Financial Account" with "FinancialAccount" (from domain#ViewName notation)
        viewId = viewId.replace(/\s+/g, '');

        return viewId;
    },

    /**
     * Convert view ID to display name
     * Formats view ID into human-readable name:
     * - "Order" → "Order"
     * - "Financial_Account" → "Financial Account"
     * - "FinancialAccount" → "Financial Account" (camelCase split)
     *
     * Note: Prefix removal is handled by fileToViewId()
     * @param {string} viewId - View ID (already processed by fileToViewId)
     * @returns {string} Display name
     */
    viewIdToName(viewId) {
        let name = viewId;

        // Split camelCase (e.g., "FinancialAccount" → "Financial Account")
        name = name.replace(/([a-z])([A-Z])/g, '$1 $2');

        // Replace separators with spaces
        name = name.replace(/[_-]/g, ' ');

        // Title case
        name = name.replace(/\b\w/g, c => c.toUpperCase());

        return name;
    },

    /**
     * Get all views as sorted array
     * @returns {Array} Array of { id, name, conceptCount }
     */
    getViewsList() {
        const views = [];
        this.viewsMap.forEach((view) => {
            views.push({
                id: view.id,
                name: view.name,
                conceptCount: view.conceptQnames.size
            });
        });

        // Sort by name
        views.sort((a, b) => a.name.localeCompare(b.name));
        return views;
    },

    /**
     * Get concepts in a view (by qname)
     * BUG-009: Returns qnames instead of names for unique identification
     * @param {string} viewId - View ID
     * @returns {Set<string>} Set of concept qnames
     */
    getConceptsInView(viewId) {
        const view = this.viewsMap.get(viewId);
        return view ? view.conceptQnames : new Set();
    },

    /**
     * Get views containing a concept
     * BUG-009: Uses qname for lookup (not name)
     * @param {string} conceptQname - Concept qname
     * @returns {Set<string>} Set of view IDs
     */
    getViewsForConcept(conceptQname) {
        return this.conceptToViews.get(conceptQname) || new Set();
    },

    /**
     * Set active view
     * @param {string|null} viewId - View ID or null for all
     */
    setActiveView(viewId) {
        this.activeView = viewId;
        console.log(`📋 Active view: ${viewId || 'All'}`);
    },

    /**
     * Check if concept should be visible in current view
     * BUG-009: Uses qname for lookup (not name)
     * @param {string} conceptQname - Concept qname
     * @returns {boolean} True if visible
     */
    isConceptInActiveView(conceptQname) {
        if (!this.activeView) return true; // No view filter = show all

        const conceptViews = this.conceptToViews.get(conceptQname);
        return conceptViews && conceptViews.has(this.activeView);
    },

    /**
     * Get active view info
     * @returns {Object|null} Active view info or null
     */
    getActiveView() {
        if (!this.activeView) return null;
        return this.viewsMap.get(this.activeView);
    }
};

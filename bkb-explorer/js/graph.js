/**
 * BKB Explorer - Graph Component
 *
 * Cytoscape.js wrapper for concept visualization.
 */

/**
 * Node CSS classes for concept categorization (ADR-058)
 *
 * IMPORTANT: When changing these classes, also update:
 * - getNodeClasses() - assigns classes to nodes
 * - applyFilter() - uses classes for visibility filtering
 * - getFilterCounts() - counts nodes by class for sidebar
 * - explorer.css - color definitions
 * - index.html - legend
 */
const NODE_CLASSES = {
    // Source-based classes (ADR-058: who is authority for definition)
    FIBO_DEF: 'fibo-def',           // FIBO is authority (green)
    SCHEMA_DEF: 'schema-def',       // Schema.org is authority (cyan)
    EXPLICIT_ALIGNED: 'explicit-aligned', // Local def + FIBO/Schema aligned (blue)
    EXPLICIT_DOMAIN: 'explicit-domain',   // Pure domain, no mapping (pastel red)
    INHERITED: 'inherited',         // Inherited from parent (light gray)
    DRAFT: 'draft',                 // Needs review (gray)

    // Special classes
    CONTEXT: 'context',             // Context concept (dotted border)
    EXTERNAL: 'external',           // External node (Schema.org/FIBO)
    PROPERTY: 'property',           // Property node (ADR-054)
    PROPERTY_TYPE: 'property-type', // Property type node
    PRIMITIVE: 'primitive',         // Primitive type (String, Integer, etc.)
    JUNCTION: 'junction',           // Categorization junction

    // Legacy classes (backwards compatibility)
    FIBO: 'fibo',
    SCHEMA: 'schema',
    DOMAIN_LOCAL: 'domain-local',
    UNKNOWN: 'unknown'
};

/**
 * Primitive types that should be hidden by default in domain visualization.
 * These are technical data types, not business concepts.
 */
const PRIMITIVE_TYPES = new Set([
    'String', 'string',
    'Integer', 'integer', 'Int', 'int',
    'Float', 'float', 'Double', 'double',
    'Boolean', 'boolean', 'Bool', 'bool',
    'Date', 'date', 'DateTime', 'datetime',
    'Time', 'time', 'Timestamp', 'timestamp',
    'Number', 'number', 'Decimal', 'decimal',
    'Binary', 'binary', 'Bytes', 'bytes',
    'UUID', 'uuid', 'GUID', 'guid',
    'Object', 'object', 'Any', 'any'
]);

const Graph = {
    cy: null,
    container: null,
    currentDomain: null,
    currentLayout: 'dagre',

    /**
     * Initialize Cytoscape instance
     */
    init(containerId) {
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.error('❌ Graph container not found');
            return;
        }

        // Show loading state
        this.container.innerHTML = '<div class="loading">Select a domain from sidebar...</div>';
    },

    /**
     * Build parent→children map from subsumptions
     * ADR-067: Replaces extends_name for child counting
     * @param {Object} domainData - Domain data with subsumptions array
     * @returns {Map} Map of parentName → [childNames]
     */
    buildParentChildMap(domainData) {
        const map = new Map();
        const subsumptions = domainData.subsumptions || [];

        subsumptions.forEach(sub => {
            // Support both formats (flat and nested)
            const child = sub.child_name || sub.child?.name;
            const parent = sub.parent_name || sub.parent?.name;
            if (!child || !parent) return;

            if (!map.has(parent)) {
                map.set(parent, []);
            }
            map.get(parent).push(child);
        });

        return map;
    },

    /**
     * Load domain data into graph
     */
    loadDomain(domainData) {
        this.currentDomain = domainData;

        // ADR-067: Build parent→children map from subsumptions (replaces extends_name)
        this.parentToChildren = this.buildParentChildMap(domainData);

        // Clear container
        this.container.innerHTML = '';

        // Build Cytoscape elements
        const elements = this.buildElements(domainData);

        // Initialize Cytoscape
        const initialLayout = this.getLayoutConfig();
        initialLayout.animate = false; // No animation on initial load

        this.cy = cytoscape({
            container: this.container,
            elements: elements,
            style: this.getStyles(),
            layout: initialLayout,
            minZoom: 0.2,
            maxZoom: 3,
            wheelSensitivity: 0.5,
            userPanningEnabled: true,   // Enable for touch gestures
            userZoomingEnabled: true,
            zoomingEnabled: true,
            panningEnabled: true
        });

        // Set up event handlers
        this.setupEventHandlers();

        // Fit graph to viewport after layout settles
        setTimeout(() => {
            this.cy.fit(50);
        }, 100);

        console.log(`📊 Graph loaded: ${elements.nodes.length} nodes, ${elements.edges.length} edges`);
    },

    /**
     * Build Cytoscape elements from domain data
     * Uses categorizations for parent-child relationships (ConceptSpeak structure)
     * Supports external_concepts[] (ADR-042) and isA relationships (ADR-043)
     */
    buildElements(domainData) {
        const nodes = [];
        const edges = [];
        const concepts = domainData.concepts || [];
        const externalConcepts = domainData.external_concepts || [];  // ADR-042
        const categorizations = domainData.categorizations || [];
        const relationships = domainData.relationships || [];
        const conceptMap = new Map(concepts.map(c => [c.name, c]));
        const internalNames = new Set(concepts.map(c => c.name));

        // ADR-068: Build name-to-qname lookup for edge creation
        const nameToQname = new Map();
        concepts.forEach(c => {
            if (c.qname) {
                nameToQname.set(c.name, c.qname);
            }
        });
        // Also add external concepts to qname lookup (only if not already in domain)
        externalConcepts.forEach(ext => {
            if (ext.qname && !nameToQname.has(ext.name)) {
                nameToQname.set(ext.name, ext.qname);
            }
        });

        // Build external concept map (ADR-042)
        // External concepts use cross-domain ref format: "Schema.org:Action"
        const externalMap = new Map();
        externalConcepts.forEach(ext => {
            const refName = `${ext.type === 'schema.org' ? 'Schema.org' : 'FIBO'}:${ext.name}`;
            externalMap.set(refName, ext);
        });

        // ADR-067: Build external concept lookup by URI
        // Used to find external concept details when subsumption has external_uri
        const externalByUri = new Map();
        externalConcepts.forEach(ext => {
            if (ext.uri) {
                externalByUri.set(ext.uri, ext);
            }
        });

        // Build parent-child map from categorizations
        const childToParent = new Map();  // child -> { parent, schema }
        const parentChildCount = new Map();  // parent -> count of children
        categorizations.forEach(cat => {
            const parentName = cat.parent_name;
            const schema = cat.category_name || '';
            const children = cat.children_names || [];
            children.forEach(childName => {
                if (internalNames.has(childName) && internalNames.has(parentName)) {
                    childToParent.set(childName, { parent: parentName, schema });
                }
            });
            // Count children for parent
            const validChildren = children.filter(ch => internalNames.has(ch));
            parentChildCount.set(parentName, (parentChildCount.get(parentName) || 0) + validChildren.length);
        });

        // Find root concepts (no parent in categorizations)
        const roots = concepts.filter(c => !childToParent.has(c.name));

        // Count descendants
        const countDescendants = (name, visited = new Set()) => {
            if (visited.has(name)) return 0;
            visited.add(name);
            const children = concepts.filter(c => childToParent.get(c.name)?.parent === name);
            return children.length + children.reduce((sum, ch) =>
                sum + countDescendants(ch.name, visited), 0);
        };

        // Get all roots with descendant counts
        const rootsWithCount = roots.map(r => ({
            concept: r,
            descendants: countDescendants(r.name)
        })).sort((a, b) => b.descendants - a.descendants);

        // Separate roots with trees vs orphan roots
        const rootsWithTrees = rootsWithCount.filter(r => r.descendants > 0).slice(0, 5);
        const orphanRoots = rootsWithCount.filter(r => r.descendants === 0);

        // If no roots with descendants, show all concepts
        const showAll = rootsWithTrees.length === 0 && orphanRoots.length === 0;

        // Collect visible nodes
        const visibleNames = new Set();

        // BUG-018 FIX: Move addTree outside if/else so it can be reused in relationship expansion
        // Recursively adds a concept and all its categorization children
        const addTree = (name, depth = 0, maxDepth = 6) => {
            if (depth > maxDepth || visibleNames.has(name)) return;
            visibleNames.add(name);
            const children = concepts.filter(c => childToParent.get(c.name)?.parent === name);
            children.forEach(ch => addTree(ch.name, depth + 1, maxDepth));
        };

        if (showAll) {
            concepts.forEach(c => visibleNames.add(c.name));
        } else {
            // Add trees from roots with descendants
            rootsWithTrees.forEach(r => addTree(r.concept.name));

            // Add orphan roots (no descendants but still in domain)
            orphanRoots.forEach(r => visibleNames.add(r.concept.name));
        }

        // Identify context concepts - view-specific if view is active (ADR-047)
        // A concept can be context in one view but full concept in another
        const contextConcepts = new Set();
        const activeView = Views.activeView;
        concepts.forEach(c => {
            if (activeView) {
                // Check if this concept is context in the active view's source
                const sources = c.sources || [];
                const viewSource = sources.find(src => {
                    const viewId = Views.fileToViewId(src.file || '');
                    return viewId === activeView;
                });
                if (viewSource && viewSource.is_context) {
                    contextConcepts.add(c.name);
                }
            } else {
                // No active view - use global type
                if (c.type === 'context_reference') {
                    contextConcepts.add(c.name);
                }
            }
        });

        // Also include concepts connected via relationships to visible nodes
        // BUG-018 FIX: Use addTree to include categorization children
        relationships.forEach(rel => {
            const subj = Utils.getRelSubject(rel);
            const obj = Utils.getRelObject(rel);
            // If one end is visible, add the other end AND its categorization children
            if (visibleNames.has(subj) && internalNames.has(obj)) {
                addTree(obj);  // BUG-018: Recursively add obj and its children
            }
            if (visibleNames.has(obj) && internalNames.has(subj)) {
                addTree(subj);  // BUG-018: Recursively add subj and its children
            }
        });

        // Hub names for styling (determined before ghost detection)
        const hubNames = new Set(rootsWithTrees.map(r => r.concept.name));

        // ===========================================
        // GHOST NODES DETECTION
        // Find domain concepts NOT in active view but referenced by visible concepts
        // These are added as "ghost" nodes with special styling
        // Only active when a specific view is selected (not "All")
        // ===========================================
        const ghostNames = new Set();
        // Reuse activeView from context detection above (line ~207)

        if (activeView) {
            // BUG-009: activeViewConcepts now contains QNAMES (not names)
            // Get concepts that ARE in the active view
            const activeViewQnames = Views.getConceptsInView(activeView) || new Set();
            console.log(`🔍 Active view: ${activeView}, concepts in view: ${activeViewQnames.size}`);

            // Helper: check if a concept (by name) is in the active view
            const isInActiveView = (name) => {
                const qname = nameToQname.get(name);
                return qname && activeViewQnames.has(qname);
            };

            // Find ghost candidates: referenced by active view concepts but not in active view
            // Check categorizations
            categorizations.forEach(cat => {
                const parent = cat.parent_name;
                const children = cat.children_names || [];

                // If parent is in active view, children not in view become ghosts
                if (isInActiveView(parent)) {
                    children.forEach(ch => {
                        if (internalNames.has(ch) && !isInActiveView(ch)) {
                            ghostNames.add(ch);
                        }
                    });
                }
                // If any child is in active view, parent not in view becomes ghost
                const hasActiveChild = children.some(ch => isInActiveView(ch));
                if (hasActiveChild && internalNames.has(parent) && !isInActiveView(parent)) {
                    ghostNames.add(parent);
                }
            });

            // Check relationships
            relationships.forEach(rel => {
                const subj = Utils.getRelSubject(rel);
                const obj = Utils.getRelObject(rel);

                if (isInActiveView(subj) && internalNames.has(obj) && !isInActiveView(obj)) {
                    ghostNames.add(obj);
                }
                if (isInActiveView(obj) && internalNames.has(subj) && !isInActiveView(subj)) {
                    ghostNames.add(subj);
                }
            });

            // Check subsumptions (domain-to-domain only)
            const subsumptionsList = domainData.subsumptions || [];
            subsumptionsList.forEach(sub => {
                const child = sub.child_name || sub.child?.name;
                const parent = sub.parent_name || sub.parent?.name;
                if (!child || !parent || sub.external_uri) return;

                if (isInActiveView(child) && internalNames.has(parent) && !isInActiveView(parent)) {
                    ghostNames.add(parent);
                }
                if (isInActiveView(parent) && internalNames.has(child) && !isInActiveView(child)) {
                    ghostNames.add(child);
                }
            });
        }

        // Get ghost concepts
        const ghostConcepts = concepts.filter(c => ghostNames.has(c.name));
        if (ghostConcepts.length > 0) {
            console.log(`👻 Ghost nodes: ${ghostConcepts.length} (from other views, referenced by active view)`);
        }

        // Get visible concepts (exclude ghosts to avoid duplicates)
        const visibleConcepts = concepts.filter(c => visibleNames.has(c.name) && !ghostNames.has(c.name));

        // BUG-009: Track QNAMES that are IN the active view (not ghosts)
        // Used to filter ghost node edges - ghosts can only connect to active view nodes
        // IMPORTANT: Use Views.getConceptsInView() for actual view membership, not visibleConcepts
        // (visibleConcepts includes expanded concepts from all views via relationship traversal)
        const activeViewQnames = activeView
            ? (Views.getConceptsInView(activeView) || new Set())
            : new Set(visibleConcepts.map(c => c.qname || c.name));

        // Helper: check if edge should be created between two nodes
        // Rule: ghost nodes can ONLY have edges to nodes IN the active view (not to other ghosts)
        // BUG-009: Uses qnames for view membership check
        const shouldCreateEdge = (name1, name2) => {
            const isGhost1 = ghostNames.has(name1);
            const isGhost2 = ghostNames.has(name2);

            // Neither is ghost: normal check (both must be visible)
            if (!isGhost1 && !isGhost2) {
                return visibleNames.has(name1) && visibleNames.has(name2);
            }
            // One is ghost: the other must be in active view (not ghost)
            // BUG-009: Convert name to qname for view membership check
            if (isGhost1 && !isGhost2) {
                const qname2 = nameToQname.get(name2);
                return qname2 && activeViewQnames.has(qname2);
            }
            if (isGhost2 && !isGhost1) {
                const qname1 = nameToQname.get(name1);
                return qname1 && activeViewQnames.has(qname1);
            }
            // Both are ghosts: don't connect ghosts to each other
            return false;
        };

        // Add nodes
        visibleConcepts.forEach(concept => {
            const isHub = hubNames.has(concept.name);
            const isContext = contextConcepts.has(concept.name);
            let classes = this.getNodeClasses(concept);
            if (isHub) classes += ' hub';
            if (isContext) classes += ' context';

            // Only count direct FIBO matches (not parent/keyword/fuzzy)
            const directMatchTypes = ['exact', 'synonym', 'override'];
            const matchType = concept.fibo_mapping?.match_type || 'none';
            const hasDirectFibo = concept.has_fibo_mapping && directMatchTypes.includes(matchType);

            // ADR-068: Use qname as node ID for uniqueness
            const nodeId = concept.qname || concept.name;
            nodes.push({
                data: {
                    id: nodeId,
                    name: concept.name,  // Display name (unchanged)
                    qname: concept.qname || '',  // ADR-068: Store qname for reference
                    definition: concept.definition?.text || '',
                    source: concept.definition?.source || 'DRAFT',
                    fiboUri: concept.fibo_mapping?.uri || null,
                    fiboLabel: concept.fibo_mapping?.label || null,
                    matchType: matchType,
                    hasFibo: hasDirectFibo,
                    hasSchema: concept.has_schema_mapping || false,
                    // ADR-067 Phase 3: extends_name deprecated, use subsumptions instead
                    childCount: parentChildCount.get(concept.name) || 0,
                    isHub: isHub,
                    isContext: isContext
                },
                classes: classes
            });
        });

        // Add ghost nodes (concepts from other views, referenced in visible relationships)
        ghostConcepts.forEach(concept => {
            // BUG-009: Use qname for view lookup
            const conceptViews = Views.getViewsForConcept(concept.qname || concept.name);
            const sourceView = conceptViews.size > 0 ? Array.from(conceptViews)[0] : null;
            const sourceViewName = sourceView ? Views.viewIdToName(sourceView) : 'unknown';

            // ADR-068: Use qname as node ID
            const ghostNodeId = concept.qname || concept.name;
            nodes.push({
                data: {
                    id: ghostNodeId,
                    name: concept.name,
                    qname: concept.qname || '',
                    definition: concept.definition?.text || '',
                    source: concept.definition?.source || 'DRAFT',
                    fiboUri: concept.fibo_mapping?.uri || null,
                    fiboLabel: concept.fibo_mapping?.label || null,
                    isGhost: true,
                    sourceView: sourceView,
                    sourceViewName: sourceViewName
                },
                classes: 'ghost'
            });

            // Add ghost to visibleNames so edges can connect to it
            visibleNames.add(concept.name);
        });

        // Add categorization edges with junction nodes
        // Structure: parent → junction (●) → children
        // Junction node shows the categorization label
        // Optimization: single-child categorizations render as direct edge (no junction)
        const addedJunctions = new Set();
        let junctionIndex = 0;

        categorizations.forEach(cat => {
            const parentName = cat.parent_name;
            const schema = cat.category_name || '';
            // Filter children: must be visible AND pass ghost edge rules
            const children = (cat.children_names || []).filter(ch =>
                visibleNames.has(ch) && shouldCreateEdge(parentName, ch)
            );

            // Skip isA categorizations - they're processed separately as isA edges (dashed)
            if (cat.type === 'isA') return;

            if (!visibleNames.has(parentName) || children.length === 0) return;

            // ADR-068: Resolve qnames for edge source/target
            const parentQname = nameToQname.get(parentName) || parentName;

            // Single-child optimization: direct edge without junction
            if (children.length === 1) {
                const childName = children[0];
                const childQname = nameToQname.get(childName) || childName;
                edges.push({
                    data: {
                        id: `cat-${parentName}-to-${childName}`,
                        source: parentQname,
                        target: childQname,
                        type: 'categorization',
                        schema: schema
                    },
                    classes: 'categorization'
                });
                return;
            }

            // Multi-child: use junction node
            const junctionId = `junction-${parentName}-${schema.replace(/\s+/g, '_')}`;
            if (addedJunctions.has(junctionId)) return;
            addedJunctions.add(junctionId);

            // Junction node (small circle with label)
            nodes.push({
                data: {
                    id: junctionId,
                    name: schema || '●',
                    label: schema,
                    isJunction: true,
                    junctionIndex: junctionIndex++
                },
                classes: 'junction'
            });

            // Trunk edge: parent → junction
            edges.push({
                data: {
                    id: `trunk-${parentName}-to-${junctionId}`,
                    source: parentQname,
                    target: junctionId,
                    type: 'trunk',
                    schema: schema
                },
                classes: 'trunk'
            });

            // Branch edges: junction → children
            children.forEach(childName => {
                const childQname = nameToQname.get(childName) || childName;
                edges.push({
                    data: {
                        id: `branch-${junctionId}-to-${childName}`,
                        source: junctionId,
                        target: childQname,
                        type: 'branch'
                    },
                    classes: 'branch'
                });
            });
        });

        // Track external concepts referenced by isA relationships (ADR-042/043)
        const referencedExternals = new Set();
        // ADR-067: Map prefixed node ID to external_uri for lookup
        const externalRefToUri = new Map();

        // Helper function to process isA relationships (can be in relationships or categorizations)
        const processIsARelationship = (rel) => {
            const relType = rel.type || '';
            const isIsA = relType === 'isA';
            if (!isIsA) return;

            // Handle categorization format (parent_name, children_names)
            // isA categorizations: children "is a" parent (e.g., IDM Country "is a" Country)
            if (rel.parent_name && rel.children_names) {
                const parent = rel.parent_name;
                const children = rel.children_names || [];
                const isContext = rel.is_context || false;

                children.forEach(child => {
                    // Use shouldCreateEdge to enforce ghost node rules
                    if (visibleNames.has(child) && visibleNames.has(parent) && shouldCreateEdge(child, parent)) {
                        // ADR-068: Use qnames for edge source/target
                        const childQname = nameToQname.get(child) || child;
                        const parentQname = nameToQname.get(parent) || parent;
                        // Context isA uses dotted line (ADR-047), regular isA uses dashed
                        const edgeClass = isContext ? 'context-isA' : 'isA';
                        edges.push({
                            data: {
                                id: `isA-cat-${child}-to-${parent}`,
                                source: childQname,
                                target: parentQname,
                                type: 'isA',
                                sourceLabel: 'is a',
                                targetLabel: '',
                                isContext: isContext
                            },
                            classes: edgeClass
                        });
                    }
                });
                return;
            }

            // Handle relationship format (source_name/subject_name, target_name/object_name)
            const subj = Utils.getRelSubject(rel);
            const obj = Utils.getRelObject(rel);
            const verbPhrase = Utils.getVerbPhrase(rel);

            // Extract short name from cross-domain ref (e.g., "Schema.org:Action" -> "Action")
            const shortName = Utils.getShortName(obj);

            const isExternalTarget = externalMap.has(obj);
            const isSchemaConceptTarget = conceptMap.has(shortName) &&
                conceptMap.get(shortName).sources?.some(s => s.type === 'schema.org');

            if (isExternalTarget || isSchemaConceptTarget) {
                referencedExternals.add(obj);
                const targetNodeId = isSchemaConceptTarget ? shortName : obj;

                if (visibleNames.has(subj)) {
                    edges.push({
                        data: {
                            id: `isA-${rel.id || Math.random()}`,
                            source: subj,
                            target: targetNodeId,
                            type: 'isA',
                            sourceLabel: verbPhrase || 'is a',
                            targetLabel: ''
                        },
                        classes: 'isA'
                    });
                }
            }
        };

        // ADR-060: Skip isA from categorizations - deprecated, use subsumptions instead
        // categorizations.forEach(processIsARelationship);

        // Add relationship edges (binary verbs from ConceptSpeak)
        relationships.forEach(rel => {
            // ADR-060: Skip isA relationships - they're deprecated, use subsumptions instead
            const relType = rel.type || '';
            const isIsA = relType === 'isA';

            if (isIsA) {
                // ADR-060: isA is deprecated, skip rendering
                // Subsumptions should be used instead (generated by ontology-lift)
                return;
            }

            const subj = Utils.getRelSubject(rel);
            const obj = Utils.getRelObject(rel);

            // Get both verb phrases for bidirectional labels
            const verbPhrase = Utils.getVerbPhrase(rel);
            const inversePhrase = (rel.inverse_verb_phrase || '').trim();

            // Check visibility AND ghost edge rules
            if (visibleNames.has(subj) && visibleNames.has(obj) && shouldCreateEdge(subj, obj)) {
                // ADR-068: Use qnames for edge source/target
                const subjQname = nameToQname.get(subj) || subj;
                const objQname = nameToQname.get(obj) || obj;
                // Context relationships get dotted styling
                const isContextRel = rel.is_context === true;
                edges.push({
                    data: {
                        id: `rel-${rel.id || Math.random()}`,
                        source: subjQname,
                        target: objQname,
                        type: 'relationship',
                        sourceLabel: verbPhrase,      // verb near subject
                        targetLabel: inversePhrase,   // inverse near object
                        isContext: isContextRel
                    },
                    classes: isContextRel ? 'relationship context-rel' : 'relationship'
                });
            }
        });

        // ===========================================
        // SUBSUMPTIONS (ADR-059, ADR-060)
        // Unified with isA - subsumption is the canonical form
        // Format: child -( label )-> parent
        // ===========================================

        // Track which concepts already have explicit subsumptions (to avoid duplicates)
        const conceptsWithSubsumption = new Set();

        const subsumptions = domainData.subsumptions || [];
        subsumptions.forEach(sub => {
            // Support both formats:
            // - sub.child_name / sub.parent_name (flat from .cs sources)
            // - sub.child.name / sub.parent.name (nested from YAML data contracts)
            const child = sub.child_name || sub.child?.name;
            const parent = sub.parent_name || sub.parent?.name;
            if (!child || !parent) return;  // Skip malformed entries

            conceptsWithSubsumption.add(child);
            const label = sub.label || 'is a kind of';
            const isContext = sub.is_context || false;

            // ADR-068: Get child qname for edge source
            const childQname = nameToQname.get(child) || child;

            // Check if parent is external - has external_uri field (ADR-067)
            const externalUri = sub.external_uri || '';
            const isExternalParent = !!externalUri;

            if (isExternalParent) {
                // ADR-067/068: Check externalByUri for richer concept data including qname
                const extConcept = externalByUri.get(externalUri);
                // ADR-068: Use qname from external concept for node ID
                const externalQname = extConcept?.qname || `ext:${parent}`;
                const externalDisplayName = extConcept?.label || extConcept?.name || parent;

                // Add to referenced externals for node creation (use qname as key)
                referencedExternals.add(externalQname);
                // Store URI for lookup during node creation
                externalRefToUri.set(externalQname, externalUri);

                if (visibleNames.has(child)) {
                    const edgeClass = isContext ? 'context-subsumption' : 'subsumption';
                    edges.push({
                        data: {
                            id: `sub-${childQname}-to-${externalQname}`,
                            source: childQname,
                            target: externalQname,  // ADR-068: Use qname for external node
                            type: 'subsumption',
                            sourceLabel: label,
                            targetLabel: '',
                            isContext: isContext
                        },
                        classes: edgeClass
                    });
                }
            } else if (visibleNames.has(child) && visibleNames.has(parent) && shouldCreateEdge(child, parent)) {
                // Both are internal concepts - apply ghost edge rules
                // ADR-068: Get parent qname for edge target
                const parentQname = nameToQname.get(parent) || parent;
                const edgeClass = isContext ? 'context-subsumption' : 'subsumption';
                edges.push({
                    data: {
                        id: `sub-${childQname}-to-${parentQname}`,
                        source: childQname,
                        target: parentQname,
                        type: 'subsumption',
                        sourceLabel: label,
                        targetLabel: '',
                        isContext: isContext
                    },
                    classes: edgeClass
                });
            }
        });

        // Build maps of FIBO labels to definitions and URIs for external node creation
        const fiboDefinitionMap = new Map();
        const fiboUriMap = new Map();
        visibleConcepts.forEach(concept => {
            const fiboMapping = concept.fibo_mapping;
            if (fiboMapping && fiboMapping.label) {
                // BUG-015: Normalize to lowercase for case-insensitive lookup
                const fiboParent = `FIBO:${fiboMapping.label.toLowerCase()}`;
                if (fiboMapping.fibo_definition) {
                    fiboDefinitionMap.set(fiboParent, fiboMapping.fibo_definition);
                }
                if (fiboMapping.uri) {
                    fiboUriMap.set(fiboParent, fiboMapping.uri);
                }
            }
        });

        // Auto-generate subsumptions from fibo_mapping (ADR-060)
        // For concepts with FIBO mapping but no explicit subsumption, create one
        visibleConcepts.forEach(concept => {
            const conceptName = concept.name;

            // Skip if already has explicit subsumption
            if (conceptsWithSubsumption.has(conceptName)) return;

            // Check for FIBO mapping
            const fiboMapping = concept.fibo_mapping;
            if (!fiboMapping || !fiboMapping.uri || fiboMapping.match_type === 'none') return;

            // ADR-068: Use qname for source and target
            const conceptQname = nameToQname.get(conceptName) || conceptName;

            // ADR-068: Try to find external concept by URI for qname
            // Handle both direct URI and ?query= wrapped URI formats
            let extConcept = externalByUri.get(fiboMapping.uri);
            if (!extConcept) {
                // Try with ?query= wrapper (external_concepts may use this format)
                const wrappedUri = `https://spec.edmcouncil.org/fibo/ontology?query=${fiboMapping.uri}`;
                extConcept = externalByUri.get(wrappedUri);
            }
            // Fallback to legacy format if no qname available
            const rawLabel = fiboMapping.label || fiboMapping.uri.split('/').pop();
            const fiboLabel = Utils.toTitleCase(rawLabel);
            const fiboParentQname = extConcept?.qname || `FIBO:${fiboLabel}`;
            const isContext = concept.type === 'context_reference';

            // Add to referenced externals for node creation
            referencedExternals.add(fiboParentQname);
            // Store URI for lookup during node creation
            if (fiboMapping.uri) {
                externalRefToUri.set(fiboParentQname, fiboMapping.uri);
            }

            // Determine label based on match_type
            let label = 'is a kind of';
            if (fiboMapping.match_type === 'exact') {
                label = 'same as';
            } else if (fiboMapping.match_type === 'synonym') {
                label = 'same as';
            }

            const edgeClass = isContext ? 'context-subsumption' : 'subsumption';
            const fiboDefinition = fiboMapping.fibo_definition || '';
            edges.push({
                data: {
                    id: `sub-auto-${conceptQname}-to-${fiboParentQname}`,
                    source: conceptQname,
                    target: fiboParentQname,
                    type: 'subsumption',
                    sourceLabel: label,
                    targetLabel: '',
                    isContext: isContext,
                    parentDefinition: fiboDefinition  // FIBO definition for tooltip
                },
                classes: edgeClass
            });
        });

        // BUG-021: Auto-generate subsumptions from hierarchy.extends for Schema.org mappings
        // For concepts with schema mapping and hierarchy.extends pointing to schema:, create subsumption
        const externalByQname = new Map();
        externalConcepts.forEach(ext => {
            if (ext.qname) {
                externalByQname.set(ext.qname, ext);
            }
        });

        visibleConcepts.forEach(concept => {
            const conceptName = concept.name;

            // Skip if already has explicit subsumption
            if (conceptsWithSubsumption.has(conceptName)) return;

            // BUG-021: Check for schema mapping via hierarchy.extends
            const extendsQname = concept.hierarchy?.extends;
            if (!extendsQname || !extendsQname.startsWith('schema:')) return;

            // Skip if no has_schema_mapping flag
            if (!concept.has_schema_mapping) return;

            // Find external concept by qname
            const extConcept = externalByQname.get(extendsQname);
            if (!extConcept) return;

            // ADR-068: Use qname for source
            const conceptQname = nameToQname.get(conceptName) || conceptName;
            const schemaQname = extConcept.qname || extendsQname;
            const isContext = concept.type === 'context_reference';

            // Add to referenced externals for node creation
            referencedExternals.add(schemaQname);
            if (extConcept.uri) {
                externalRefToUri.set(schemaQname, extConcept.uri);
            }

            // BUG-021: Use "same as" for same-name mappings (e.g., Car → schema:Car)
            const label = conceptName.toLowerCase() === (extConcept.label || extConcept.name).toLowerCase()
                ? 'same as'
                : 'is a kind of';

            const edgeClass = isContext ? 'context-subsumption' : 'subsumption';
            edges.push({
                data: {
                    id: `sub-schema-${conceptQname}-to-${schemaQname}`,
                    source: conceptQname,
                    target: schemaQname,
                    type: 'subsumption',
                    sourceLabel: label,
                    targetLabel: '',
                    isContext: isContext,
                    parentDefinition: extConcept.definition || ''
                },
                classes: edgeClass
            });
        });

        // Add external concept nodes for referenced isA/subsumption targets (ADR-042, ADR-060, ADR-067, ADR-068)
        referencedExternals.forEach(extRef => {
            // ADR-068: extRef is now a qname (e.g., "fibo-fnd-dat-fd:Date")
            // Try to look up by URI stored during subsumption processing
            const storedUri = externalRefToUri.get(extRef);
            const extByUri = storedUri ? externalByUri.get(storedUri) : null;

            // Then try legacy lookup by prefixed name (backwards compatibility)
            const ext = extByUri || externalMap.get(extRef);

            if (ext) {
                // Found in external_concepts[] - use qname as ID (ADR-068)
                const displayName = ext.label || ext.name;
                const nodeId = ext.qname || extRef;  // Use qname, fallback to extRef
                nodes.push({
                    data: {
                        id: nodeId,  // ADR-068: qname for uniqueness
                        name: displayName,  // Display name
                        qname: ext.qname || '',  // ADR-068: Store qname for reference
                        definition: ext.definition || '',
                        source: ext.type === 'schema.org' ? 'Schema.org' : 'FIBO',
                        fiboUri: ext.uri,
                        fiboLabel: displayName,
                        isExternal: true,
                        externalType: ext.type
                    },
                    classes: 'external'
                });
            } else if (extRef.startsWith('FIBO:') || extRef.startsWith('Schema.org:')) {
                // Legacy format: Create external node from subsumption data (not in external_concepts[])
                const prefix = extRef.startsWith('FIBO:') ? 'FIBO' : 'Schema.org';
                const shortName = extRef.substring(prefix.length + 1);  // Remove "FIBO:" or "Schema.org:"
                const externalType = prefix === 'FIBO' ? 'fibo' : 'schema.org';

                // Get definition and URI from maps if available (for auto-generated subsumptions)
                // BUG-015: Normalize to lowercase for case-insensitive lookup
                const lookupKey = `${prefix}:${shortName.toLowerCase()}`;
                const extDefinition = fiboDefinitionMap.get(lookupKey) || '';
                const extUri = storedUri || fiboUriMap.get(lookupKey) || '';

                nodes.push({
                    data: {
                        id: extRef,  // Keep legacy format for fallback
                        name: shortName,
                        qname: '',  // No qname available in legacy format
                        definition: extDefinition,
                        source: prefix,
                        fiboUri: extUri,
                        fiboLabel: shortName,
                        isExternal: true,
                        externalType: externalType
                    },
                    classes: 'external'
                });
            } else if (extRef.includes(':')) {
                // ADR-068: QName format (e.g., "fibo-fnd-dat-fd:Date", "omg-dat:Date")
                // This handles qnames that don't have data in external_concepts[]
                const colonIdx = extRef.lastIndexOf(':');
                const localName = extRef.substring(colonIdx + 1);
                const prefix = extRef.substring(0, colonIdx);
                const isOmg = prefix.startsWith('omg-');
                const externalType = isOmg ? 'omg' : 'fibo';
                const extDefinition = fiboDefinitionMap.get(extRef) || '';
                const extUri = storedUri || fiboUriMap.get(extRef) || '';

                nodes.push({
                    data: {
                        id: extRef,  // Use qname as ID
                        name: localName,  // Display local name
                        qname: extRef,
                        definition: extDefinition,
                        source: isOmg ? 'OMG Commons' : 'FIBO',
                        fiboUri: extUri,
                        fiboLabel: localName,
                        isExternal: true,
                        externalType: externalType
                    },
                    classes: 'external'
                });
            } else {
                // Legacy format: Schema.org concept in concepts[] array
                // extRef might be "Schema.org:Action", but concept is named "Action"
                const shortName = Utils.getShortName(extRef);
                const schemaConcept = conceptMap.get(shortName);
                if (schemaConcept && schemaConcept.sources?.some(s => s.type === 'schema.org')) {
                    // Mark as external and add class
                    const existingNode = nodes.find(n => n.data.name === shortName);
                    if (existingNode) {
                        existingNode.data.isExternal = true;
                        existingNode.data.externalType = 'schema.org';
                        existingNode.classes = (existingNode.classes || '') + ' external';
                    }
                }
            }
        });

        // Add cross-domain indicator for concepts shared between domains
        // NOTE: Cross-domain tracking disabled in lazy loading mode
        // Would need to load all domains to determine cross-domain concepts
        // TODO: Implement cross-domain tracking with lazy loading

        // ===========================================
        // PROPERTIES (ADR-054, ADR-055)
        // Property nodes: Concept --[has property]--> Property --[isA]--> Concept
        // ===========================================
        const properties = domainData.properties || [];
        const propertyTypes = domainData.property_types || [];

        // ADR-055: Build concept ID → name lookup for isA resolution
        const conceptIdToName = {};
        (domainData.concepts || []).forEach(c => {
            conceptIdToName[c.id] = c.name;
        });

        // Add property type nodes (shared across properties)
        // ADR-055: Skip if a Concept with same name exists (avoid duplicates like ISIN)
        const addedPropertyTypes = new Set();
        propertyTypes.forEach(pt => {
            const typeId = `pt-${pt.id}`;
            // Skip if concept with same name already exists
            if (visibleNames.has(pt.name)) {
                return;
            }
            if (!addedPropertyTypes.has(typeId)) {
                addedPropertyTypes.add(typeId);
                const isPrimitive = PRIMITIVE_TYPES.has(pt.name);
                nodes.push({
                    data: {
                        id: typeId,
                        name: pt.name,
                        definition: pt.definition || '',
                        isPropertyType: true,
                        isPrimitive: isPrimitive
                    },
                    classes: isPrimitive ? 'property-type primitive' : 'property-type'
                });
            }
        });

        // Add property nodes and edges
        properties.forEach(prop => {
            const propId = `prop-${prop.id}`;
            const parentId = prop.parent_concept;
            const typeId = `pt-${prop.type_id}`;

            // Only add if parent concept is visible
            if (!visibleNames.has(parentId)) return;

            // ADR-068: Get parent qname for edge source
            const parentQname = nameToQname.get(parentId) || parentId;

            // Property node
            // BUG-009: Store both name and qname of parent for view filtering
            nodes.push({
                data: {
                    id: propId,
                    name: prop.name,
                    parentConcept: parentId,
                    parentConceptQname: parentQname,
                    propertyType: prop.type,
                    isProperty: true,
                    annotations: prop.annotations || []
                },
                classes: 'property'
            });

            // Edge: Concept --[has property]--> Property
            edges.push({
                data: {
                    id: `has-prop-${parentQname}-${prop.id}`,
                    source: parentQname,
                    target: propId,
                    type: 'has-property',
                    label: 'has property'
                },
                classes: 'has-property'
            });

            // Edge: Property --[has type]--> PropertyType
            if (addedPropertyTypes.has(typeId)) {
                edges.push({
                    data: {
                        id: `has-type-${prop.id}`,
                        source: propId,
                        target: typeId,
                        type: 'has-type',
                        label: 'has type'
                    },
                    classes: 'has-type'
                });
            }

            // ADR-055: Edge: Property --[isA]--> Definition Concept
            // Links property to its business concept (e.g., isin isA ISIN)
            // Uses definition_concept_id, looks up name at runtime (Single Source of Truth)
            if (prop.definition_concept_id) {
                const defConceptName = conceptIdToName[prop.definition_concept_id];
                if (defConceptName && visibleNames.has(defConceptName)) {
                    // ADR-068: Use qname for target
                    const defConceptQname = nameToQname.get(defConceptName) || defConceptName;
                    edges.push({
                        data: {
                            id: `isa-${prop.id}`,
                            source: propId,
                            target: defConceptQname,
                            type: 'isA',
                            label: 'is a'
                        },
                        classes: 'isA'
                    });
                }
            }
        });

        return { nodes, edges };
    },

    /**
     * Calculate connectivity score for each concept
     */
    calculateConnectivity(concepts) {
        const connectivity = {};
        // NOTE: Cross-domain tracking disabled in lazy loading mode
        const crossDomain = {};

        concepts.forEach(concept => {
            let score = 0;

            // ADR-067: Count children using parentToChildren map (subsumptions)
            const children = this.parentToChildren?.get(concept.name) || [];
            score += children.length;

            // Bonus for cross-domain (disabled in lazy loading)
            if (crossDomain[concept.name]) {
                score += crossDomain[concept.name].domains.length * 2;
            }

            // Bonus for direct FIBO mapping (exact/synonym/override only)
            const directMatchTypes = ['exact', 'synonym', 'override'];
            const matchType = concept.fibo_mapping?.match_type || 'none';
            if (concept.has_fibo_mapping && directMatchTypes.includes(matchType)) {
                score += 1;
            }

            connectivity[concept.name] = score;
        });

        return connectivity;
    },

    /**
     * Get top N concepts by connectivity
     */
    getTopConcepts(concepts, connectivity, limit) {
        return [...concepts]
            .sort((a, b) => (connectivity[b.name] || 0) - (connectivity[a.name] || 0))
            .slice(0, limit);
    },

    /**
     * Count children of a concept
     * ADR-067: Uses parentToChildren map from subsumptions
     */
    countChildren(conceptName, concepts) {
        const children = this.parentToChildren?.get(conceptName) || [];
        return children.length;
    },

    /**
     * Get CSS classes for a node
     * Color based on definition.source (who is the authority for the definition)
     * Categories: fibo-def, explicit-fibo, explicit-domain, inherited, draft
     *
     * Color scheme (ADR-017 Domain-First, FIBO-Aligned):
     * - Green (#d5f4e6): FIBO is authority (source=FIBO)
     * - Blue (#e3f2fd): Local definition + FIBO aligned (source=EXPLICIT, has_fibo)
     * - Pastel Red (#f8d7da): Pure domain concept (source=EXPLICIT, no mapping) - MOST IMPORTANT
     * - Light Pink (#fce4e7): Draft domain definition - needs review (source=DRAFT)
     * - Light Gray (#eceff1): Inherited from parent (source=INHERITED)
     */
    getNodeClasses(concept) {
        const classes = [];
        // Only consider FIBO/Schema mapping as "real" for high-confidence matches
        // parent/keyword/fuzzy matches are too weak to count as proper alignment
        const directMatchTypes = ['exact', 'synonym', 'override'];
        const matchType = concept.fibo_mapping?.match_type || 'none';
        const hasFibo = concept.has_fibo_mapping && directMatchTypes.includes(matchType);
        const hasSchema = concept.has_schema_mapping || false;
        const source = (concept.definition?.source || 'DRAFT').toUpperCase();

        // Determine category based on definition source (who defines the concept)
        if (source === 'FIBO') {
            // FIBO is the authority for definition
            classes.push('fibo-def');
        } else if (source === 'SCHEMA') {
            // Schema.org is the authority for definition
            classes.push('schema-def');
        } else if (source === 'EXPLICIT') {
            if (hasFibo || hasSchema) {
                // Local definition but aligned with external standard
                classes.push('explicit-aligned');
            } else {
                // Pure domain concept - NO external mapping (MOST IMPORTANT)
                classes.push('explicit-domain');
            }
        } else if (source === 'INHERITED') {
            classes.push('inherited');
        } else {
            // DRAFT or unknown
            classes.push('draft');
        }

        return classes.join(' ');
    },

    /**
     * Get Cytoscape styles
     * Based on BKB (Business Knowledge Blueprint) visual notation
     * See ConceptSpeak-Visual-Manual.md for reference
     */
    getStyles() {
        return [
            // ===========================================
            // BASE EDGE STYLE (fallback) - must be first
            // ===========================================
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#95a5a6',
                    'curve-style': 'bezier'
                }
            },

            // ===========================================
            // CONCEPT NODES - Solid rectangle, bold text, 2px border
            // ===========================================
            {
                selector: 'node',
                style: {
                    'shape': 'rectangle',
                    'width': 'label',
                    'height': 36,
                    'padding': '12px',
                    'label': 'data(name)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': 12,
                    'font-weight': 700,  // Bold per BKB notation
                    'background-color': '#dedaff',  // Light purple (BKB default)
                    'border-width': 1,
                    'border-color': '#1a1a1a'  // Dark border
                }
            },
            // FIBO definition - green fill (FIBO is authority)
            {
                selector: 'node.fibo-def',
                style: {
                    'background-color': '#d5f4e6'  // Green
                }
            },
            // Schema.org definition - cyan fill (Schema.org is authority)
            {
                selector: 'node.schema-def',
                style: {
                    'background-color': '#d4f4f4'  // Cyan/teal
                }
            },
            // Explicit + aligned - blue fill (local def, FIBO/Schema aligned)
            {
                selector: 'node.explicit-aligned',
                style: {
                    'background-color': '#e3f2fd'  // Blue
                }
            },
            // Explicit domain - pastel red fill (pure domain, NO mapping - MOST IMPORTANT)
            {
                selector: 'node.explicit-domain',
                style: {
                    'background-color': '#f8d7da'  // Pastel red
                }
            },
            // Inherited - light gray fill
            {
                selector: 'node.inherited',
                style: {
                    'background-color': '#eceff1'  // Light gray
                }
            },
            // Draft - light pink (needs review, related to domain)
            {
                selector: 'node.draft',
                style: {
                    'background-color': '#fce4e7'  // Light pink - draft domain
                }
            },
            // Legacy classes for backwards compatibility
            {
                selector: 'node.fibo',
                style: {
                    'background-color': '#d5f4e6'
                }
            },
            {
                selector: 'node.schema',
                style: {
                    'background-color': '#e3f2fd'
                }
            },
            {
                selector: 'node.domain-local',
                style: {
                    'background-color': '#dedaff'
                }
            },
            {
                selector: 'node.unknown',
                style: {
                    'background-color': '#fef3e2'
                }
            },
            // Cross-domain indicator - thicker border
            {
                selector: 'node.cross-domain',
                style: {
                    'border-width': 6
                }
            },
            // Ghost node - concept from another view, referenced in visible relationships
            // Dotted border (like context), semi-transparent, gray tint
            {
                selector: 'node.ghost',
                style: {
                    'opacity': 0.7,
                    'border-style': 'dotted',
                    'border-width': 2,
                    'border-color': '#888888',
                    'background-color': '#f0f0f0',
                    'color': '#666666'
                }
            },
            // External concept node (Schema.org/FIBO - ADR-042)
            // Distinct style: dashed border, gray fill, italic text
            {
                selector: 'node.external',
                style: {
                    'background-color': '#f5f5f5',
                    'border-style': 'dashed',
                    'border-width': 1,
                    'border-color': '#666666',
                    'font-style': 'italic',
                    'color': '#666666'
                }
            },
            // Hub node (root of tree)
            {
                selector: 'node.hub',
                style: {
                    'font-size': 14,
                    'height': 42
                }
            },
            // Highlighted (search match) - purple like hover
            {
                selector: 'node.highlighted',
                style: {
                    'border-color': '#9b59b6',
                    'border-width': 5,
                    'background-color': '#f5eef8'
                }
            },
            // Edge hover - connected nodes (dynamic styling applied in JS)
            // Note: actual border-width is set dynamically as original + 2

            // ===========================================
            // CONTEXT NODES (type: context_reference)
            // Must come LAST to override all other node styles
            // ===========================================
            {
                selector: 'node.context',
                style: {
                    'border-style': 'dotted',
                    'border-width': 1,
                    'border-color': '#1a1a1a',
                    'background-color': '#ffffff'
                }
            },

            // ===========================================
            // JUNCTION NODES (categorization branch points)
            // Small filled circle, 8px diameter (same as line width)
            // ===========================================
            {
                selector: 'node.junction',
                style: {
                    'shape': 'ellipse',
                    'width': 2,
                    'height': 2,
                    'background-color': '#333333',
                    'border-width': 0,
                    'padding': 0,
                    'label': ''  // Label moved to trunk edge
                }
            },

            // ===========================================
            // PROPERTY NODES (ADR-054)
            // Orange fill, smaller than concept nodes
            // ===========================================
            {
                selector: 'node.property',
                style: {
                    'shape': 'rectangle',
                    'width': 'label',
                    'height': 28,
                    'padding': '8px',
                    'background-color': '#ffe4c4',  // Bisque/light orange
                    'border-width': 1,
                    'border-color': '#d2691e',  // Chocolate border
                    'font-size': 10,
                    'font-weight': 400  // Normal weight (not bold like concepts)
                }
            },

            // ===========================================
            // PROPERTY TYPE NODES (ADR-054)
            // Gray fill, shared across properties
            // ===========================================
            {
                selector: 'node.property-type',
                style: {
                    'shape': 'rectangle',
                    'width': 'label',
                    'height': 28,
                    'padding': '8px',
                    'background-color': '#e0e0e0',  // Light gray
                    'border-width': 1,
                    'border-color': '#808080',  // Gray border
                    'font-size': 10,
                    'font-weight': 400,
                    'font-style': 'italic'
                }
            },


            // ===========================================
            // BINARY VERB EDGES (relationships)
            // Thin line (2px), purple color for visibility
            // Labels on both ends: verb near source, inverse near target
            // ===========================================
            {
                selector: 'edge.relationship',
                style: {
                    'width': 1,  // Thin line per CSV
                    'line-color': '#9b59b6',  // Purple for binary verbs
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'none',
                    'source-arrow-shape': 'none',
                    // Source label (verb_phrase near subject)
                    'source-label': 'data(sourceLabel)',
                    'source-text-offset': 15,
                    'source-text-margin-y': -6,
                    // Target label (inverse_verb_phrase near object)
                    'target-label': 'data(targetLabel)',
                    'target-text-offset': 5,
                    'target-text-margin-y': -6,
                    // Common label styling
                    'font-size': 9,
                    'color': '#8e44ad',
                    'text-background-color': '#fff',
                    'text-background-opacity': 0.9,
                    'text-background-padding': '2px'
                }
            },
            // Context relationship edges (dotted 1px)
            // Edges connecting to/from context concepts
            {
                selector: 'edge.context-rel',
                style: {
                    'width': 1,
                    'line-style': 'dotted',
                    'line-color': '#9b59b6'
                }
            },
            // isA relationship edges (ADR-043, ADR-060: DEPRECATED - use subsumption)
            // Purple dashed line - same as subsumption for visual consistency
            {
                selector: 'edge.isA',
                style: {
                    'width': 1,
                    'line-color': '#8e44ad',
                    'line-style': 'dashed',
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': '#8e44ad',
                    'label': 'data(sourceLabel)',
                    'text-rotation': 'autorotate',
                    'font-size': 12,
                    'color': '#8e44ad',
                    'font-weight': 'bold',
                    'text-background-color': '#ffffff',
                    'text-background-opacity': 1.0,
                    'text-background-padding': '4px',
                    'text-background-shape': 'roundrectangle',
                    'z-index': 100
                }
            },
            // Context isA edges (ADR-047, ADR-060: DEPRECATED - use subsumption)
            // Dotted purple line for context concept isA relationships
            {
                selector: 'edge.context-isA',
                style: {
                    'width': 1,
                    'line-style': 'dotted',
                    'line-color': '#8e44ad',
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': '#8e44ad',
                    'label': 'data(sourceLabel)',
                    'text-rotation': 'autorotate',
                    'font-size': 12,
                    'color': '#8e44ad',
                    'font-weight': 'bold',
                    'text-background-color': '#ffffff',
                    'text-background-opacity': 1.0,
                    'text-background-padding': '4px',
                    'text-background-shape': 'roundrectangle',
                    'z-index': 100
                }
            },
            // Subsumption edges (ADR-059, ADR-060)
            // Dashed purple line with arrow, shows explicit label
            {
                selector: 'edge.subsumption',
                style: {
                    'width': 1,
                    'line-color': '#8e44ad',
                    'line-style': 'dashed',
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': '#8e44ad',
                    'label': 'data(sourceLabel)',
                    'text-rotation': 'autorotate',
                    'font-size': 10,
                    'color': '#8e44ad',
                    'text-background-color': '#ffffff',
                    'text-background-opacity': 1.0,
                    'text-background-padding': '4px',
                    'text-background-shape': 'roundrectangle',
                    'z-index': 100
                }
            },
            // Context subsumption edges (ADR-059, ADR-060)
            // Dotted purple line for context concept subsumptions
            {
                selector: 'edge.context-subsumption',
                style: {
                    'width': 1,
                    'line-style': 'dotted',
                    'line-color': '#8e44ad',
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': '#8e44ad',
                    'label': 'data(sourceLabel)',
                    'text-rotation': 'autorotate',
                    'font-size': 10,
                    'color': '#8e44ad',
                    'text-background-color': '#ffffff',
                    'text-background-opacity': 1.0,
                    'text-background-padding': '4px',
                    'text-background-shape': 'roundrectangle',
                    'z-index': 100
                }
            },
            // Transitive relationship edges (ADR-048)
            // Dotted line, gray, thin - computed when intermediate nodes hidden
            {
                selector: 'edge.transitive',
                style: {
                    'width': 1,
                    'line-color': '#999999',
                    'line-style': 'dotted',
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'none',
                    'source-arrow-shape': 'none',
                    'label': 'data(hops)',
                    'font-size': 8,
                    'color': '#999999',
                    'text-background-color': '#fff',
                    'text-background-opacity': 0.9,
                    'text-background-padding': '1px'
                }
            },

            // ===========================================
            // PROPERTY EDGES (ADR-054)
            // ===========================================
            // has-property: Concept → Property (orange, thin)
            {
                selector: 'edge.has-property',
                style: {
                    'width': 1,
                    'line-color': '#d2691e',  // Chocolate
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'none',
                    'source-label': 'data(label)',
                    'source-text-offset': 20,
                    'source-text-margin-y': -6,
                    'font-size': 8,
                    'color': '#d2691e',
                    'text-background-color': '#fff',
                    'text-background-opacity': 0.9,
                    'text-background-padding': '1px'
                }
            },
            // has-type: Property → PropertyType (gray, thin)
            {
                selector: 'edge.has-type',
                style: {
                    'width': 1,
                    'line-color': '#808080',  // Gray
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'none',
                    'source-label': 'data(label)',
                    'source-text-offset': 15,
                    'source-text-margin-y': -6,
                    'font-size': 8,
                    'color': '#808080',
                    'text-background-color': '#fff',
                    'text-background-opacity': 0.9,
                    'text-background-padding': '1px'
                }
            },
            // ADR-055: isA: Property → Definition Concept (purple, dashed)
            {
                selector: 'edge.isA',
                style: {
                    'width': 1,
                    'line-color': '#9370db',  // Medium purple
                    'line-style': 'dashed',
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': '#9370db',
                    'source-label': 'data(label)',
                    'source-text-offset': 15,
                    'source-text-margin-y': -6,
                    'font-size': 8,
                    'color': '#9370db',
                    'text-background-color': '#fff',
                    'text-background-opacity': 0.9,
                    'text-background-padding': '1px'
                }
            },

            // ===========================================
            // CATEGORIZATION EDGES - MUST BE LAST for CSS priority
            // ===========================================
            // Trunk: parent → junction (haystack spreads edges along node border)
            {
                selector: 'edge.trunk',
                style: {
                    'width': 2,
                    'line-color': '#333333',
                    'curve-style': 'haystack',
                    'haystack-radius': 0.5,
                    'label': 'data(schema)',
                    'font-size': 10,
                    'color': '#333333',
                    'text-background-color': '#fff',
                    'text-background-opacity': 0.9,
                    'text-background-padding': '2px'
                }
            },
            // Branch: junction → children
            {
                selector: 'edge.branch',
                style: {
                    'width': 2,
                    'line-color': '#333333',
                    'curve-style': 'unbundled-bezier',
                    'control-point-distances': 20,
                    'control-point-weights': 0.5
                }
            },
            // Single-child categorization: direct edge (no junction)
            {
                selector: 'edge.categorization',
                style: {
                    'width': 2,
                    'line-color': '#333333',
                    'curve-style': 'bezier',
                    'label': 'data(schema)',
                    'font-size': 10,
                    'color': '#333333',
                    'text-background-color': '#fff',
                    'text-background-opacity': 0.9,
                    'text-background-padding': '2px'
                }
            },

            // ===========================================
            // EDGE HIGHLIGHT (on hover)
            // Note: actual width is set dynamically as original + 2
            // ===========================================
        ];
    },

    /**
     * Check if we're on mobile
     */
    isMobile() {
        return window.innerWidth <= 768 || 'ontouchstart' in window;
    },

    /**
     * Currently selected node (for mobile tap-to-select)
     */
    selectedNode: null,
    selectedEdge: null,

    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Node hover - show tooltip and highlight (desktop only)
        this.cy.on('mouseover', 'node', (e) => {
            if (this.isMobile()) return; // Skip on mobile
            const node = e.target;
            if (!node.hasClass('junction')) {
                Tooltip.show(node, e.renderedPosition);
                this.highlightNode(node);
            }
        });

        this.cy.on('mouseout', 'node', () => {
            if (this.isMobile()) return;
            Tooltip.hide();
            if (this.selectedNode) return;  // Keep highlight if clicked, but hide tooltip
            this.clearEdgeHighlight();
        });

        // Edge hover - show edge tooltip and highlight (desktop only)
        this.cy.on('mouseover', 'edge', (e) => {
            if (this.isMobile()) return; // Skip on mobile
            const edge = e.target;
            Tooltip.showEdge(edge, e.renderedPosition);
            this.highlightEdge(edge);
        });

        this.cy.on('mouseout', 'edge', () => {
            if (this.isMobile()) return;
            Tooltip.hideEdge();
            if (this.selectedEdge) return;  // Keep highlight if clicked, but hide tooltip
            this.clearEdgeHighlight();
        });

        // Node tap - different behavior for mobile vs desktop
        this.cy.on('tap', 'node', (e) => {
            const node = e.target;
            if (node.hasClass('junction')) return;

            // Both mobile and desktop: tap/click shows tooltip and highlight
            this.clearSelection();
            Tooltip.hideEdge();
            this.selectedNode = node;
            this.highlightNode(node);
            Tooltip.show(node, e.renderedPosition);
        });

        // Edge tap - show tooltip (both mobile and desktop)
        this.cy.on('tap', 'edge', (e) => {
            const edge = e.target;
            this.clearSelection();
            Tooltip.hide();
            this.selectedEdge = edge;
            Tooltip.showEdge(edge, e.renderedPosition);
            this.highlightEdge(edge);
        });

        // Canvas tap - deselect and hide tooltips
        this.cy.on('tap', (e) => {
            if (e.target === this.cy) {
                this.clearSelection();
                Tooltip.hide();
                Tooltip.hideEdge();
            }
        });

        // Right-click panning
        this.setupRightClickPan();

        // Manual wheel zoom (in case default doesn't work)
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;  // Zoom out/in
            const zoom = this.cy.zoom() * delta;
            const boundedZoom = Math.max(this.cy.minZoom(), Math.min(this.cy.maxZoom(), zoom));

            // Zoom toward mouse position
            const rect = this.container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.cy.zoom({
                level: boundedZoom,
                renderedPosition: { x, y }
            });
        }, { passive: false });
    },

    /**
     * Set up right-click panning
     */
    setupRightClickPan() {
        let isPanning = false;
        let lastX, lastY;

        // Prevent context menu on graph
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        this.container.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Right click
                isPanning = true;
                lastX = e.clientX;
                lastY = e.clientY;
                this.container.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isPanning) {
                const dx = e.clientX - lastX;
                const dy = e.clientY - lastY;
                lastX = e.clientX;
                lastY = e.clientY;
                // Use panBy for incremental panning
                this.cy.panBy({ x: dx, y: dy });
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 2 && isPanning) {
                isPanning = false;
                this.container.style.cursor = 'default';
            }
        });
    },

    /**
     * Clear mobile selection state
     */
    clearSelection() {
        this.selectedNode = null;
        this.selectedEdge = null;
        this.clearEdgeHighlight();
    },

    /**
     * Toggle node expansion
     */
    toggleExpand(node) {
        const nodeId = node.id();
        const isExpanded = BKBExplorer.state.expandedNodes.has(nodeId);

        if (isExpanded) {
            this.collapseNode(node);
            BKBExplorer.state.expandedNodes.delete(nodeId);
        } else {
            this.expandNode(node);
            BKBExplorer.state.expandedNodes.add(nodeId);
        }
    },

    /**
     * Expand a node to show children
     * ADR-067: Uses parentToChildren map from subsumptions
     * ADR-068: Uses qnames for node IDs
     */
    expandNode(node) {
        const nodeId = node.id();  // qname
        const nodeName = node.data('name');  // display name
        const concepts = this.currentDomain.concepts || [];
        const conceptMap = new Map(concepts.map(c => [c.name, c]));

        // ADR-067: Find children using parentToChildren map
        const childNames = this.parentToChildren?.get(nodeName) || [];
        const children = childNames.map(name => conceptMap.get(name)).filter(Boolean);

        // Add children nodes
        const directMatchTypes = ['exact', 'synonym', 'override'];
        children.forEach(child => {
            // ADR-068: Use qname as node ID
            const childNodeId = child.qname || child.name;
            if (!this.cy.getElementById(childNodeId).length) {
                const matchType = child.fibo_mapping?.match_type || 'none';
                const hasDirectFibo = child.has_fibo_mapping && directMatchTypes.includes(matchType);
                this.cy.add({
                    data: {
                        id: childNodeId,
                        name: child.name,
                        qname: child.qname || '',
                        definition: child.definition?.text || '',
                        source: child.definition?.source || 'DRAFT',
                        hasFibo: hasDirectFibo
                    },
                    classes: this.getNodeClasses(child)
                });

                this.cy.add({
                    data: {
                        id: `${nodeId}-to-${childNodeId}`,
                        source: nodeId,      // parent (top)
                        target: childNodeId,  // child (bottom)
                        type: 'extends'
                    },
                    classes: 'extends'
                });
            }
        });

        // Re-run layout
        this.cy.layout({
            name: 'dagre',
            rankDir: 'TB',
            animate: true,
            animationDuration: 300
        }).run();
    },

    /**
     * Collapse a node to hide children
     */
    collapseNode(node) {
        const nodeId = node.id();

        // Find and remove children (edges go parent→child, so source=parent, target=child)
        const childEdges = this.cy.edges().filter(e =>
            e.data('source') === nodeId && e.data('type') === 'extends'
        );

        childEdges.forEach(edge => {
            const childId = edge.data('target');
            this.cy.getElementById(childId).remove();
        });
    },

    /**
     * Focus on a specific node
     */
    focusNode(nodeName) {
        const node = this.cy.getElementById(nodeName);
        if (node.length) {
            this.cy.animate({
                center: { eles: node },
                zoom: 1.5
            }, {
                duration: 500
            });
            node.select();
        }
    },

    /**
     * Highlight nodes matching search
     */
    highlightSearch(query) {
        const lowerQuery = query.toLowerCase();

        this.cy.nodes().forEach(node => {
            const name = node.data('name').toLowerCase();
            if (name.includes(lowerQuery)) {
                node.addClass('highlighted');
            } else {
                node.removeClass('highlighted');
            }
        });
    },

    /**
     * Clear search highlight
     */
    clearHighlight() {
        this.cy.nodes().removeClass('highlighted');
    },

    /**
     * Apply highlight style to a node (dynamic +2 border width)
     */
    applyNodeHighlight(node) {
        if (node.data('_origBorderWidth') !== undefined) return; // Already highlighted

        const origWidth = node.numericStyle('border-width') || 1;
        const origColor = node.style('border-color');

        node.data('_origBorderWidth', origWidth);
        node.data('_origBorderColor', origColor);
        node.addClass('edge-connected');
        node.style({
            'border-width': origWidth + 2,
            'border-color': '#9b59b6'
        });
    },

    /**
     * Apply highlight style to an edge (dynamic +2 line width)
     */
    applyEdgeHighlight(edge) {
        if (edge.data('_origWidth') !== undefined) return; // Already highlighted

        const origWidth = edge.numericStyle('width') || 2;
        const origColor = edge.style('line-color');

        edge.data('_origWidth', origWidth);
        edge.data('_origColor', origColor);
        edge.addClass('edge-highlighted');
        edge.style({
            'width': origWidth + 2,
            'line-color': '#9b59b6',
            'z-index': 999
        });
    },

    /**
     * Highlight connected edges/concepts (but not the node itself)
     * Used for mobile tap where node gets :selected styling
     */
    highlightConnected(node) {
        // Get all connected edges
        const connectedEdges = node.connectedEdges();

        connectedEdges.forEach(edge => {
            const type = edge.data('type') || '';

            if (type === 'trunk') {
                // This node is parent, highlight trunk and all branches
                this.applyEdgeHighlight(edge);
                const junctionId = edge.target().id();

                const branchEdges = this.cy.edges().filter(e =>
                    e.data('type') === 'branch' && e.data('source') === junctionId
                );
                branchEdges.forEach(branchEdge => {
                    this.applyEdgeHighlight(branchEdge);
                    this.applyNodeHighlight(branchEdge.target());
                });

            } else if (type === 'branch') {
                // This node is child, highlight branch and trunk to parent
                this.applyEdgeHighlight(edge);
                const junctionId = edge.source().id();

                const trunkEdge = this.cy.edges().filter(e =>
                    e.data('type') === 'trunk' && e.data('target') === junctionId
                ).first();

                if (trunkEdge && trunkEdge.length > 0) {
                    this.applyEdgeHighlight(trunkEdge);
                    this.applyNodeHighlight(trunkEdge.source());
                }

            } else if (type === 'relationship' || type === 'isA' || type === 'subsumption' || type === 'transitive' || type === 'has-property' || type === 'has-type') {
                // Binary verb, isA, subsumption, transitive, or property edge - highlight edge and other endpoint
                this.applyEdgeHighlight(edge);
                const otherNode = edge.source().id() === node.id() ? edge.target() : edge.source();
                this.applyNodeHighlight(otherNode);
            }
        });
    },

    /**
     * Highlight node and all connected edges/concepts
     */
    highlightNode(node) {
        // Highlight the node itself
        this.applyNodeHighlight(node);

        // Get all connected edges
        const connectedEdges = node.connectedEdges();

        connectedEdges.forEach(edge => {
            const type = edge.data('type') || '';

            if (type === 'trunk') {
                // This node is parent, highlight trunk and all branches
                this.applyEdgeHighlight(edge);
                const junctionId = edge.target().id();

                const branchEdges = this.cy.edges().filter(e =>
                    e.data('type') === 'branch' && e.data('source') === junctionId
                );
                branchEdges.forEach(branchEdge => {
                    this.applyEdgeHighlight(branchEdge);
                    this.applyNodeHighlight(branchEdge.target());
                });

            } else if (type === 'branch') {
                // This node is child, highlight branch and trunk to parent
                this.applyEdgeHighlight(edge);
                const junctionId = edge.source().id();

                const trunkEdge = this.cy.edges().filter(e =>
                    e.data('type') === 'trunk' && e.data('target') === junctionId
                ).first();

                if (trunkEdge && trunkEdge.length > 0) {
                    this.applyEdgeHighlight(trunkEdge);
                    this.applyNodeHighlight(trunkEdge.source());
                }

            } else if (type === 'relationship' || type === 'isA' || type === 'subsumption' || type === 'transitive' || type === 'has-property' || type === 'has-type') {
                // Binary verb, isA, subsumption, transitive, or property edge - highlight edge and other endpoint
                this.applyEdgeHighlight(edge);
                const otherNode = edge.source().id() === node.id() ? edge.target() : edge.source();
                this.applyNodeHighlight(otherNode);
            }
        });
    },

    /**
     * Highlight edge and connected concepts
     */
    highlightEdge(edge) {
        const data = edge.data();
        const type = data.type || '';

        // Highlight the edge
        this.applyEdgeHighlight(edge);

        if (type === 'branch') {
            // For branch: highlight child and find actual parent through trunk
            const junctionNode = edge.source();
            const childNode = edge.target();
            const junctionId = junctionNode.id();

            // Find trunk edge to get actual parent
            const trunkEdge = this.cy.edges().filter(e =>
                e.data('type') === 'trunk' && e.data('target') === junctionId
            ).first();

            if (trunkEdge && trunkEdge.length > 0) {
                const parentNode = trunkEdge.source();
                this.applyNodeHighlight(parentNode);
                this.applyEdgeHighlight(trunkEdge);
            }
            this.applyNodeHighlight(childNode);

        } else if (type === 'trunk') {
            // For trunk: highlight parent and all children through branches
            const parentNode = edge.source();
            const junctionNode = edge.target();
            const junctionId = junctionNode.id();

            this.applyNodeHighlight(parentNode);

            // Find all branch edges from this junction
            const branchEdges = this.cy.edges().filter(e =>
                e.data('type') === 'branch' && e.data('source') === junctionId
            );
            branchEdges.forEach(branchEdge => {
                this.applyEdgeHighlight(branchEdge);
                this.applyNodeHighlight(branchEdge.target());
            });

        } else {
            // For regular edges: highlight both endpoints
            this.applyNodeHighlight(edge.source());
            this.applyNodeHighlight(edge.target());
        }
    },

    /**
     * Clear edge highlight and restore original styles
     */
    clearEdgeHighlight() {
        // Restore node original styles by REMOVING inline styles (allows stylesheet to apply)
        this.cy.nodes('.edge-connected').forEach(node => {
            node.removeStyle('border-width');
            node.removeStyle('border-color');
            node.removeData('_origBorderWidth');
            node.removeData('_origBorderColor');
            node.removeClass('edge-connected');
        });

        // Restore edge original styles by REMOVING inline styles
        this.cy.edges('.edge-highlighted').forEach(edge => {
            edge.removeStyle('width');
            edge.removeStyle('line-color');
            edge.removeStyle('z-index');
            edge.removeData('_origWidth');
            edge.removeData('_origColor');
            edge.removeClass('edge-highlighted');
        });
    },

    /**
     * Apply filter based on CST element visibility toggles and view filter
     * @param {Object} show - visibility toggles { domain, fibo, schema, context, categorizations, relationships, orphans, transitive, primitive }
     */
    applyFilter(show) {
        const prevShowCat = this._prevShowCategorizations;
        const prevShowRel = this._prevShowRelationships;
        this._prevShowCategorizations = show.categorizations;
        this._prevShowRelationships = show.relationships;

        // Find child concepts (targets of branch edges) to hide with categorizations
        const childConcepts = new Set();
        if (!show.categorizations) {
            this.cy.edges('.branch').forEach(edge => {
                const targetId = edge.target().id();
                childConcepts.add(targetId);
            });
        }

        // Get active view filter
        const activeView = Views.activeView;

        this.cy.nodes().forEach(node => {
            // Handle junction nodes
            if (node.hasClass('junction')) {
                if (show.categorizations) {
                    node.show();
                } else {
                    node.hide();
                }
                return;
            }

            // Handle external nodes (Schema.org/FIBO - ADR-042)
            if (node.hasClass('external')) {
                const source = node.data('source');
                let visible = false;
                if (source === 'Schema.org') {
                    visible = show.schema;
                } else if (source === 'FIBO' || source === 'OMG Commons') {
                    // OMG Commons is part of FIBO ecosystem
                    visible = show.fibo;
                }
                // Also check view filter for external nodes (ADR-044: inherited sources)
                // BUG-009: Use qname for view membership check
                if (visible && activeView) {
                    visible = Views.isConceptInActiveView(node.data('qname') || node.data('name'));
                }
                if (visible) {
                    node.show();
                } else {
                    node.hide();
                }
                return;
            }

            // Handle property and property-type nodes (ADR-054)
            // BUG-010: Properties follow their parent concept's visibility
            if (node.hasClass('property') || node.hasClass('property-type')) {
                // Hide primitive types unless show.primitive is enabled
                if (node.hasClass('primitive') && !show.primitive) {
                    node.hide();
                    return;
                }

                if (node.hasClass('property')) {
                    // Property nodes: follow parent concept visibility
                    // BUG-010: Use parentConceptQname (node IDs are qnames)
                    const parentQname = node.data('parentConceptQname') || node.data('parentConcept');
                    const parentNode = parentQname ? this.cy.getElementById(parentQname) : null;

                    // Check if parent would be visible based on toggles
                    if (parentNode && parentNode.length > 0) {
                        const parentIsContext = parentNode.hasClass('context');
                        const parentIsDomain = !parentNode.hasClass('external') && !parentIsContext;

                        // Hide property if parent's toggle is off
                        if (parentIsContext && !show.context) {
                            node.hide();
                            return;
                        }
                        if (parentIsDomain && !show.domain) {
                            node.hide();
                            return;
                        }
                    }

                    // Also check view filter
                    if (activeView) {
                        if (parentQname && !Views.isConceptInActiveView(parentQname)) {
                            node.hide();
                            return;
                        }
                    }
                } else if (node.hasClass('property-type')) {
                    // Property-type nodes: visible if ANY property using this type would be visible
                    const typeName = node.data('name');
                    const self = this;
                    const hasVisibleProperty = this.cy.nodes('.property').some(propNode => {
                        if (propNode.data('propertyType') !== typeName) return false;

                        // Check if this property's parent would be visible
                        // BUG-010: Use parentConceptQname (node IDs are qnames)
                        const parentQname = propNode.data('parentConceptQname') || propNode.data('parentConcept');
                        const parentNode = parentQname ? self.cy.getElementById(parentQname) : null;
                        if (!parentNode || parentNode.length === 0) return false;

                        const parentIsContext = parentNode.hasClass('context');
                        const parentIsDomain = !parentNode.hasClass('external') && !parentIsContext;

                        if (parentIsContext && !show.context) return false;
                        if (parentIsDomain && !show.domain) return false;

                        // Check view filter
                        if (activeView) {
                            if (parentQname && !Views.isConceptInActiveView(parentQname)) return false;
                        }

                        return true;
                    });
                    if (!hasVisibleProperty) {
                        node.hide();
                        return;
                    }
                }

                node.show();
                return;
            }

            let visible = false;
            const isContext = node.hasClass('context');
            const nodeId = node.id();

            // Determine visibility based on concept type toggles
            // New source-based classes (ADR-058): fibo-def, schema-def, explicit-aligned, explicit-domain, inherited, draft
            // Legacy classes kept for backwards compatibility: fibo, schema, domain-local, unknown
            //
            // IMPORTANT: All domain concepts are controlled by Domain toggle
            //            fibo-def = domain concept with FIBO definition → Domain toggle
            //            external + source=FIBO = external FIBO concept → FIBO toggle (handled above)
            if (isContext) {
                visible = show.context;
            } else if (node.hasClass('fibo-def') || node.hasClass('fibo')) {
                // Domain concepts with FIBO mapping/definition - show under Domain toggle
                visible = show.domain;
            } else if (node.hasClass('schema-def') || node.hasClass('schema')) {
                // Domain concepts with Schema.org mapping - show under Domain toggle
                visible = show.domain;
            } else if (node.hasClass('explicit-aligned')) {
                // Explicit + aligned shows under "Domain" since it's a domain concept
                visible = show.domain;
            } else if (node.hasClass('explicit-domain') || node.hasClass('domain-local')) {
                visible = show.domain;
            } else if (node.hasClass('draft') || node.hasClass('inherited') || node.hasClass('unknown')) {
                // Draft/inherited are also domain concepts - show under Domain toggle
                visible = show.domain;
            } else {
                // Fallback: any unclassified node is treated as domain concept
                visible = show.domain;
            }

            // Hide child concepts when categorizations are hidden
            if (!show.categorizations && childConcepts.has(nodeId)) {
                visible = false;
            }

            // Apply view filter (if active)
            // Ghost nodes bypass view filter - they're intentionally from other views
            // BUG-009: Use qname for view membership check (fixes name collision issue)
            if (visible && activeView && !node.hasClass('ghost')) {
                visible = Views.isConceptInActiveView(node.data('qname') || node.data('name'));
            }

            if (visible) {
                node.show();
            } else {
                node.hide();
            }
        });

        // Handle edge visibility
        this.cy.edges().forEach(edge => {
            const source = edge.source();
            const target = edge.target();
            const type = edge.data('type');

            // Hide if endpoints are hidden
            if (source.hidden() || target.hidden()) {
                edge.hide();
            }
            // Hide context edges when context toggle is off
            else if (!show.context && (edge.hasClass('context-isA') || edge.hasClass('context-subsumption') || edge.hasClass('context-rel'))) {
                edge.hide();
            }
            // Hide categorization edges (trunk/branch) when toggle is off
            else if (!show.categorizations && (type === 'trunk' || type === 'branch')) {
                edge.hide();
            }
            // Hide relationship edges (including isA, has-property, has-type) when toggle is off
            else if (!show.relationships && (type === 'relationship' || type === 'isA' || type === 'has-property' || type === 'has-type')) {
                edge.hide();
            } else {
                edge.show();
            }
        });

        // ALWAYS hide external nodes without visible edges (regardless of Orphans toggle)
        // External nodes only make sense when connected to visible domain concepts
        this.cy.nodes('.external').forEach(node => {
            if (node.hidden()) return;
            const visibleEdges = node.connectedEdges().filter(edge => !edge.hidden());
            if (visibleEdges.length === 0) {
                node.hide();
            }
        });

        // Hide junction nodes without visible TRUNK edges (BUG-025 part 2)
        // If trunk is hidden (parent context is hidden), junction should be hidden
        // This prevents ghost-only junctions from staying visible
        this.cy.nodes('.junction').forEach(node => {
            if (node.hidden()) return;
            const trunkEdges = node.connectedEdges().filter(edge =>
                edge.data('type') === 'trunk' && !edge.hidden()
            );
            if (trunkEdges.length === 0) {
                node.hide();
                // Also hide all edges connected to this junction
                node.connectedEdges().forEach(edge => edge.hide());
            }
        });

        // Also hide junctions without visible branch edges (original logic)
        this.cy.nodes('.junction').forEach(node => {
            if (node.hidden()) return;
            const branchEdges = node.connectedEdges().filter(edge =>
                edge.data('type') === 'branch' && !edge.hidden()
            );
            if (branchEdges.length === 0) {
                node.hide();
                node.connectedEdges().forEach(edge => edge.hide());
            }
        });

        // Detect and handle orphans (nodes with no visible edges)
        if (!show.orphans) {
            this.cy.nodes().forEach(node => {
                if (node.hidden() || node.hasClass('junction')) return;

                // Count visible edges for this node
                const visibleEdges = node.connectedEdges().filter(edge => !edge.hidden());
                if (visibleEdges.length === 0) {
                    node.hide();
                }
            });

            // Hide edges connected to newly hidden orphan nodes
            this.cy.edges().forEach(edge => {
                if (edge.source().hidden() || edge.target().hidden()) {
                    edge.hide();
                }
            });
        }

        // Handle transitive edges (ADR-048)
        if (show.transitive) {
            this.computeTransitiveEdges();
        } else {
            this.removeTransitiveEdges();
        }

        // Re-run layout only on visible elements to compact the graph
        const visibleElements = this.cy.elements().filter(ele => !ele.hidden());
        visibleElements.layout(this.getLayoutConfig()).run();
    },

    /**
     * Get layout configuration based on current layout type
     */
    getLayoutConfig() {
        const baseConfig = {
            animate: true,
            animationDuration: 300,
            padding: 20
        };

        switch (this.currentLayout) {
            case 'dagre':
                return {
                    ...baseConfig,
                    name: 'dagre',
                    rankDir: 'TB',
                    nodeSep: 15,
                    rankSep: 40,
                    edgeSep: 10
                };
            case 'cose':
                return {
                    ...baseConfig,
                    name: 'cose',
                    nodeRepulsion: 4000,
                    idealEdgeLength: 100,
                    edgeElasticity: 100,
                    nestingFactor: 5,
                    gravity: 80,
                    numIter: 1000,
                    coolingFactor: 0.95
                };
            case 'breadthfirst':
                return {
                    ...baseConfig,
                    name: 'breadthfirst',
                    directed: true,
                    spacingFactor: 1.5
                };
            case 'circle':
                return {
                    ...baseConfig,
                    name: 'circle',
                    spacingFactor: 1.5
                };
            case 'grid':
                return {
                    ...baseConfig,
                    name: 'grid',
                    spacingFactor: 1.2
                };
            case 'concentric':
                return {
                    ...baseConfig,
                    name: 'concentric',
                    spacingFactor: 1.5,
                    concentric: (node) => node.degree(),
                    levelWidth: () => 2
                };
            default:
                return {
                    ...baseConfig,
                    name: 'dagre',
                    rankDir: 'TB'
                };
        }
    },

    /**
     * Set and apply new layout
     */
    setLayout(layoutName) {
        this.currentLayout = layoutName;
        const visibleElements = this.cy.elements().filter(ele => !ele.hidden());
        visibleElements.layout(this.getLayoutConfig()).run();
    },

    /**
     * Compute transitive edges to bridge hidden intermediate nodes (ADR-048)
     * When node B is hidden in path A→B→C, creates transitive edge A···C
     */
    computeTransitiveEdges() {
        if (!this.cy) return;

        // Remove existing transitive edges
        this.cy.remove('.transitive');

        // Build adjacency from visible relationship edges
        const adjacency = new Map();  // nodeId -> Set of {target, hops}
        const hiddenNodes = new Set();

        // Collect hidden nodes
        this.cy.nodes().forEach(node => {
            if (node.hidden() && !node.hasClass('junction')) {
                hiddenNodes.add(node.id());
            }
        });

        // Build adjacency from all semantic edges (relationships, isA, categorizations)
        this.cy.edges().forEach(edge => {
            const type = edge.data('type');
            const isCategorization = edge.hasClass('trunk') || edge.hasClass('branch');
            if (type !== 'relationship' && type !== 'isA' && !isCategorization) return;

            const sourceId = edge.source().id();
            const targetId = edge.target().id();

            if (!adjacency.has(sourceId)) adjacency.set(sourceId, new Set());
            if (!adjacency.has(targetId)) adjacency.set(targetId, new Set());

            adjacency.get(sourceId).add(targetId);
            adjacency.get(targetId).add(sourceId);  // Undirected for transitivity
        });

        // BFS to find transitive connections through hidden nodes
        const transitiveEdges = [];
        const visited = new Set();

        this.cy.nodes().forEach(startNode => {
            if (startNode.hidden() || startNode.hasClass('junction')) return;

            const startId = startNode.id();
            const queue = [[startId, 0, [startId]]];  // [nodeId, hops, path]
            const localVisited = new Set([startId]);

            while (queue.length > 0) {
                const [currentId, hops, path] = queue.shift();
                const neighbors = adjacency.get(currentId) || new Set();

                for (const neighborId of neighbors) {
                    if (localVisited.has(neighborId)) continue;
                    localVisited.add(neighborId);

                    const newPath = [...path, neighborId];
                    const newHops = hops + 1;

                    const neighborNode = this.cy.getElementById(neighborId);
                    const isJunction = neighborNode.hasClass('junction');

                    if (hiddenNodes.has(neighborId) || isJunction) {
                        // Continue through hidden node or junction
                        queue.push([neighborId, newHops, newPath]);
                    } else if (newHops > 1) {
                        // Found visible node through hidden intermediate
                        const edgeKey = [startId, neighborId].sort().join('|');
                        if (!visited.has(edgeKey)) {
                            visited.add(edgeKey);
                            transitiveEdges.push({
                                group: 'edges',
                                data: {
                                    id: `transitive-${startId}-${neighborId}`,
                                    source: startId,
                                    target: neighborId,
                                    type: 'transitive',
                                    hops: newHops,
                                    path: newPath.join(' → ')
                                },
                                classes: 'transitive'
                            });
                        }
                    }
                }
            }
        });

        // Add transitive edges to graph
        if (transitiveEdges.length > 0) {
            this.cy.add(transitiveEdges);
        }

        return transitiveEdges.length;
    },

    /**
     * Remove all transitive edges
     */
    removeTransitiveEdges() {
        if (!this.cy) return;
        this.cy.remove('.transitive');
    },

    /**
     * Calculate filter counts for current domain
     * BUG-010: Counts concepts in active view (potential counts, not current visibility)
     *
     * Counts represent how many items ARE in each category within the active view.
     * They don't change based on other toggle states - they show the potential.
     */
    getFilterCounts() {
        if (!this.cy) return { domain: 0, fibo: 0, schema: 0, orphans: 0, context: 0, categorizations: 0, relationships: 0, transitive: 0, primitive: 0 };

        const counts = { domain: 0, fibo: 0, schema: 0, orphans: 0, context: 0, categorizations: 0, relationships: 0, transitive: 0, primitive: 0 };

        // BUG-010: Get active view for filtering
        const activeView = Views.activeView;

        // Helper to check if concept is in active view (by qname)
        const isInView = (qname) => {
            if (!activeView) return true;
            return Views.isConceptInActiveView(qname);
        };

        // Count nodes by type
        this.cy.nodes().forEach(node => {
            if (node.hasClass('junction')) return;

            // BUG-010: Skip property and property-type nodes from toggle counts
            // They automatically follow their parent concept's visibility
            if (node.hasClass('property') || node.hasClass('property-type')) {
                return;
            }

            // Get qname for view filtering
            const qname = node.data('qname') || node.data('name');

            // Count primitive types (have their own toggle)
            if (node.hasClass('primitive')) {
                if (isInView(qname)) counts.primitive++;
                return;
            }

            // External nodes (Schema.org/FIBO) count in their category
            if (node.hasClass('external')) {
                if (!isInView(qname)) return;
                const source = node.data('source');
                if (source === 'Schema.org') {
                    counts.schema++;
                } else if (source === 'FIBO' || source === 'OMG Commons') {
                    counts.fibo++;
                }
                return;
            }

            // BUG-025 FIX: Count ghost orphans (ghosts are not in view but may be orphans)
            // Ghost nodes bypass view filter but still need orphan counting
            if (node.hasClass('ghost')) {
                const visibleEdges = node.connectedEdges().filter(e => !e.hidden());
                if (!node.hidden() && visibleEdges.length === 0) {
                    counts.orphans++;
                }
                return;  // Ghosts don't count in domain/context toggles
            }

            // Skip nodes not in view
            if (!isInView(qname)) return;

            // Domain concepts by source class (ADR-058)
            if (node.hasClass('context')) {
                counts.context++;
            } else if (node.hasClass('fibo-def') || node.hasClass('fibo')) {
                counts.domain++;
            } else if (node.hasClass('schema-def') || node.hasClass('schema')) {
                counts.domain++;
            } else if (node.hasClass('explicit-aligned')) {
                counts.domain++;
            } else if (node.hasClass('explicit-domain') || node.hasClass('domain-local')) {
                counts.domain++;
            } else if (node.hasClass('draft') || node.hasClass('inherited') || node.hasClass('unknown')) {
                counts.domain++;
            } else {
                counts.domain++;
            }

            // Count orphans (visible nodes with no visible edges)
            const visibleEdges = node.connectedEdges().filter(e => !e.hidden());
            if (!node.hidden() && visibleEdges.length === 0) {
                counts.orphans++;
            }
        });

        // Count edges by type (at least one endpoint must be in view)
        this.cy.edges().forEach(edge => {
            // BUG-010: Skip edges where NEITHER endpoint is in view
            if (activeView) {
                const srcQname = edge.source().data('qname') || edge.source().data('name');
                const tgtQname = edge.target().data('qname') || edge.target().data('name');
                if (!isInView(srcQname) && !isInView(tgtQname)) return;
            }

            const type = edge.data('type');
            if (type === 'trunk' || type === 'branch') {
                counts.categorizations++;
            } else if (type === 'relationship' || type === 'isA') {
                counts.relationships++;  // isA counts as relationship
            } else if (type === 'transitive') {
                counts.transitive++;
            }
        });

        return counts;
    }
};

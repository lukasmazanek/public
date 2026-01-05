/**
 * BKB Explorer - Tooltip Component
 *
 * Handles hover tooltips for concept and edge details.
 */

const Tooltip = {
    element: null,
    edgeElement: null,

    /**
     * Check if we're on mobile
     */
    isMobile() {
        return window.innerWidth <= 768;
    },

    /**
     * Initialize tooltip
     */
    init() {
        this.element = document.getElementById('tooltip');
        this.edgeElement = document.getElementById('edge-tooltip');

        // On mobile, tap outside graph to close tooltip
        if (this.isMobile()) {
            document.addEventListener('click', (e) => {
                // Don't close if clicking on tooltip or graph container
                if (e.target.closest('.tooltip') || e.target.closest('#graph-container')) {
                    return;
                }
                this.hide();
                this.hideEdge();
            });
        }
    },

    /**
     * Show tooltip for a node
     */
    show(node, position) {
        if (!this.element) return;

        const data = node.data();

        // Get node bounding box to position tooltip outside
        const bb = node.renderedBoundingBox();
        this.nodeBox = bb;

        // Set content
        document.getElementById('tooltip-name').textContent = data.name;

        // Set source badge (definition authority)
        const sourceBadge = document.getElementById('tooltip-badge-source');
        let source;
        if (data.isProperty) {
            // Properties come from data contracts = domain explicit
            source = 'EXPLICIT';
        } else if (data.isPropertyType) {
            // Technical data types (String, Integer, etc.)
            source = 'DATATYPE';
        } else {
            source = data.source || 'DRAFT';
        }
        sourceBadge.textContent = source;
        sourceBadge.className = 'tooltip-badge source-badge ' + source.toLowerCase();

        // Set mapping badge (external alignment) - only if source is different from mapping
        // If source IS FIBO/Schema, don't show redundant mapping badge
        const mappingBadge = document.getElementById('tooltip-badge-mapping');
        const sourceUpper = source.toUpperCase();
        const isFiboSource = sourceUpper === 'FIBO';
        const isSchemaSource = sourceUpper === 'SCHEMA' || sourceUpper === 'SCHEMA.ORG';

        if (data.hasFibo && !isFiboSource) {
            // Domain concept mapped to FIBO
            mappingBadge.textContent = '✓FIBO';
            mappingBadge.className = 'tooltip-badge mapping-badge fibo';
            mappingBadge.style.display = 'inline-block';
        } else if (data.hasSchema && !isSchemaSource) {
            // Domain concept mapped to Schema.org
            mappingBadge.textContent = '✓Schema';
            mappingBadge.className = 'tooltip-badge mapping-badge schema';
            mappingBadge.style.display = 'inline-block';
        } else {
            // No mapping or source IS the mapping - hide badge
            mappingBadge.style.display = 'none';
        }

        // Set definition
        document.getElementById('tooltip-definition').textContent =
            data.definition || 'No definition available.';

        // Set FIBO/external info with clickable link
        const fiboEl = document.getElementById('tooltip-fibo');
        if (data.isExternal && data.fiboUri) {
            // External node with URI - show clickable link
            const extType = data.externalType === 'fibo' ? 'FIBO' : 'Schema.org';
            const esc = Utils.escapeHtml;
            fiboEl.innerHTML = `${extType}: <a href="${esc(data.fiboUri)}" target="_blank" rel="noopener">${esc(data.name)} ↗</a>`;
            fiboEl.style.display = 'block';
        } else if (data.isExternal) {
            // External node without URI
            const extType = data.externalType === 'fibo' ? 'FIBO' : 'Schema.org';
            fiboEl.textContent = `${extType}: ${data.name}`;
            fiboEl.style.display = 'block';
        } else if (data.hasFibo && data.fiboUri) {
            // Domain concept mapped to FIBO - show clickable link
            const esc = Utils.escapeHtml;
            fiboEl.innerHTML = `✓ FIBO: <a href="${esc(data.fiboUri)}" target="_blank" rel="noopener">${esc(data.fiboLabel || 'mapped')} ↗</a>`;
            fiboEl.style.display = 'block';
        } else {
            fiboEl.style.display = 'none';
        }

        // Set cross-domain info
        const crossEl = document.getElementById('tooltip-cross');
        if (data.crossDomains && data.crossDomains.length > 0) {
            crossEl.textContent = `⧉ Shared: ${data.crossDomains.join(', ')}`;
            crossEl.style.display = 'block';
        } else {
            crossEl.style.display = 'none';
        }

        // Set children count
        document.getElementById('tooltip-children').textContent =
            `▼ Children: ${data.childCount || 0}`;

        // Set portal actions
        const actionsEl = document.getElementById('tooltip-actions');
        if (data.crossDomains && data.crossDomains.length > 0) {
            const esc = Utils.escapeHtml;
            actionsEl.innerHTML = data.crossDomains.map(domain =>
                `<button onclick="BKBExplorer.portal('${esc(domain)}', '${esc(data.name)}')">→ ${esc(domain)}</button>`
            ).join('');
            actionsEl.style.display = 'flex';
        } else {
            actionsEl.style.display = 'none';
        }

        // Position tooltip
        this.position(position);

        // Show
        this.element.style.display = 'block';
    },

    /**
     * Position tooltip near the node (outside the node)
     */
    position(renderedPosition) {
        // On mobile, CSS handles positioning as bottom sheet
        if (this.isMobile()) {
            return;
        }

        const container = document.getElementById('graph-container');
        const containerRect = container.getBoundingClientRect();

        // Position to the right of the node
        let x, y;
        if (this.nodeBox) {
            x = containerRect.left + this.nodeBox.x2 + 15;
            y = containerRect.top + this.nodeBox.y1;
        } else {
            x = containerRect.left + renderedPosition.x + 30;
            y = containerRect.top + renderedPosition.y - 20;
        }

        // Show temporarily to measure
        this.element.style.visibility = 'hidden';
        this.element.style.display = 'block';
        const tooltipRect = this.element.getBoundingClientRect();
        this.element.style.visibility = 'visible';

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // If tooltip goes off right edge, show on left of node
        if (x + tooltipRect.width > viewportWidth - 20) {
            if (this.nodeBox) {
                x = containerRect.left + this.nodeBox.x1 - tooltipRect.width - 15;
            } else {
                x = containerRect.left + renderedPosition.x - tooltipRect.width - 30;
            }
        }

        // Keep within vertical bounds
        if (y + tooltipRect.height > viewportHeight - 20) {
            y = viewportHeight - tooltipRect.height - 20;
        }
        if (y < 20) {
            y = 20;
        }

        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
    },

    /**
     * Hide tooltip
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    },

    /**
     * Show tooltip for an edge
     */
    showEdge(edge, position) {
        if (!this.edgeElement) return;

        const data = edge.data();
        const type = data.type || 'edge';
        const esc = Utils.escapeHtml;  // XSS protection

        // Get source and target names (escaped)
        const sourceName = esc(edge.source().data('name') || data.source);
        const targetName = esc(edge.target().data('name') || data.target);

        // Set type header
        const typeEl = document.getElementById('edge-tooltip-type');
        const relationEl = document.getElementById('edge-tooltip-relation');
        const cstEl = document.getElementById('edge-tooltip-cst');
        const badgeEl = document.getElementById('edge-tooltip-badge');
        const defEl = document.getElementById('edge-tooltip-definition');

        // Reset optional elements
        badgeEl.style.display = 'none';
        defEl.style.display = 'none';

        if (type === 'relationship') {
            // Binary verb relationship
            const verb = esc(data.sourceLabel || 'relates to');
            const inverse = esc(data.targetLabel || '');

            typeEl.textContent = 'Binary Verb';

            // Show both forward and inverse statements
            if (inverse) {
                relationEl.innerHTML = `<strong>${sourceName}</strong> ${verb} <strong>${targetName}</strong><br><strong>${targetName}</strong> ${inverse} <strong>${sourceName}</strong>`;
            } else {
                relationEl.innerHTML = `<strong>${sourceName}</strong> ${verb} <strong>${targetName}</strong>`;
            }

            // CST notation: Subject [verb phrase | inverse phrase] Object
            if (inverse) {
                cstEl.innerHTML = `<code>${sourceName} [${verb} | ${inverse}] ${targetName}</code>`;
            } else {
                cstEl.innerHTML = `<code>${sourceName} [${verb}] ${targetName}</code>`;
            }
        } else if (type === 'trunk' || type === 'branch') {
            // Categorization edge
            typeEl.textContent = 'Categorization';

            if (type === 'trunk') {
                const schema = esc(data.schema || '');
                relationEl.innerHTML = `<strong>${sourceName}</strong> is categorized by "${schema}"`;
                cstEl.innerHTML = `<code>${sourceName} =&lt; @ ${schema} &gt;= [...]</code>`;
            } else {
                // Branch: junction → child
                // Find the trunk edge to get the actual parent and schema
                const junctionNode = edge.source();
                const junctionId = junctionNode.id();
                const cy = edge.cy();

                // Find trunk edge (parent → junction)
                const trunkEdge = cy.edges().filter(e =>
                    e.data('type') === 'trunk' && e.data('target') === junctionId
                ).first();

                let parentName = 'Parent';
                let schema = '';

                if (trunkEdge && trunkEdge.length > 0) {
                    parentName = esc(trunkEdge.source().data('name') || 'Parent');
                    schema = esc(trunkEdge.data('schema') || '');
                }

                // Format: "Child is {schema} Parent"
                // Remove bracketed concept from schema (e.g., "kind of [Payment]" → "kind of")
                const schemaClean = schema.replace(/\s*\[[^\]]*\]\s*/g, ' ').trim();
                const schemaText = schemaClean ? schemaClean : 'kind of';
                relationEl.innerHTML = `<strong>${targetName}</strong> is ${schemaText} <strong>${parentName}</strong>`;
                cstEl.innerHTML = `<code>${parentName} =&lt; @ ${schema} &gt;= [${targetName}, ...]</code>`;
            }
        } else if (type === 'transitive') {
            // Transitive relationship (ADR-048)
            const hops = parseInt(data.hops, 10) || 2;  // Ensure numeric
            const path = esc(data.path || '');

            typeEl.textContent = 'Transitive Relationship';
            relationEl.innerHTML = `<strong>${sourceName}</strong> ··· <strong>${targetName}</strong> <em>(${hops} hops)</em>`;

            if (path) {
                cstEl.innerHTML = `<code>via: ${path}</code>`;
            } else {
                cstEl.innerHTML = `<code>${sourceName} ··· ${targetName}</code>`;
            }
        } else if (type === 'subsumption' || type === 'isA') {
            // Subsumption relationship (ADR-059, ADR-060)
            const label = esc(data.sourceLabel || 'is a kind of');
            const targetNode = edge.target();
            const targetData = targetNode.data();

            // Show badge for external parent (FIBO or Schema.org)
            const parentSource = targetData.source || '';
            if (parentSource.toUpperCase() === 'FIBO' || targetData.isExternal && targetData.externalType === 'fibo') {
                badgeEl.textContent = 'FIBO';
                badgeEl.className = 'tooltip-badge mapping-badge fibo';
                badgeEl.style.display = 'inline-block';
            } else if (parentSource.toUpperCase() === 'SCHEMA.ORG' || parentSource.toUpperCase() === 'SCHEMA' ||
                       targetData.isExternal && targetData.externalType === 'schema.org') {
                badgeEl.textContent = 'Schema.org';
                badgeEl.className = 'tooltip-badge mapping-badge schema';
                badgeEl.style.display = 'inline-block';
            }

            typeEl.textContent = 'Mapping';
            relationEl.innerHTML = `<strong>${sourceName}</strong> ${label} <strong>${targetName}</strong>`;

            // No definition on edge - definition belongs to concept, not relationship
            cstEl.innerHTML = `<code>${sourceName} -( ${label} )-> ${targetName}</code>`;
        } else {
            // Generic edge
            typeEl.textContent = 'Relationship';
            relationEl.innerHTML = `<strong>${sourceName}</strong> → <strong>${targetName}</strong>`;
            cstEl.innerHTML = `<code>${sourceName} → ${targetName}</code>`;
        }

        // Position and show
        this.positionEdge(position);
        this.edgeElement.style.display = 'block';
    },

    /**
     * Position edge tooltip (away from edge)
     */
    positionEdge(renderedPosition) {
        // On mobile, CSS handles positioning as bottom sheet
        if (this.isMobile()) {
            return;
        }

        const container = document.getElementById('graph-container');
        const containerRect = container.getBoundingClientRect();

        // Calculate base position (container offset + rendered position)
        const baseX = containerRect.left + renderedPosition.x;
        const baseY = containerRect.top + renderedPosition.y;

        // Show temporarily to measure
        this.edgeElement.style.visibility = 'hidden';
        this.edgeElement.style.display = 'block';
        const tooltipRect = this.edgeElement.getBoundingClientRect();
        this.edgeElement.style.visibility = 'visible';

        // Use Utils for viewport-aware positioning
        const pos = Utils.calculateTooltipPosition({
            x: baseX,
            y: baseY,
            tooltipWidth: tooltipRect.width,
            tooltipHeight: tooltipRect.height,
            offsetX: 40,
            offsetY: 30
        });

        this.edgeElement.style.left = pos.x + 'px';
        this.edgeElement.style.top = pos.y + 'px';
    },

    /**
     * Hide edge tooltip
     */
    hideEdge() {
        if (this.edgeElement) {
            this.edgeElement.style.display = 'none';
        }
    }
};

/**
 * BKB Explorer - Unit Tests
 *
 * Tests for pure functions in utils.js, views.js, and graph.js
 * Run with: npm test
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

// ============================================
// UTILS TESTS
// ============================================

// --- Utils.getDomainSegment ---
function getDomainSegment(domainPath) {
    return domainPath.includes(':')
        ? domainPath.split(':').pop().toLowerCase()
        : domainPath.toLowerCase();
}

describe('Utils.getDomainSegment', () => {
    it('extracts last segment from colon-separated path', () => {
        assert.strictEqual(getDomainSegment('RBCZ:MIB:Investment'), 'investment');
    });

    it('extracts last segment from deep path', () => {
        assert.strictEqual(getDomainSegment('A:B:C:D:E'), 'e');
    });

    it('lowercases single segment', () => {
        assert.strictEqual(getDomainSegment('Investment'), 'investment');
    });

    it('handles already lowercase input', () => {
        assert.strictEqual(getDomainSegment('test'), 'test');
    });
});

// --- Utils.getRelSubject ---
function getRelSubject(rel) {
    return rel.subject_name || rel.source_name || rel.from || '';
}

describe('Utils.getRelSubject', () => {
    it('returns subject_name when present', () => {
        assert.strictEqual(getRelSubject({ subject_name: 'Order' }), 'Order');
    });

    it('falls back to source_name', () => {
        assert.strictEqual(getRelSubject({ source_name: 'Payment' }), 'Payment');
    });

    it('falls back to from', () => {
        assert.strictEqual(getRelSubject({ from: 'Account' }), 'Account');
    });

    it('returns empty string when no field present', () => {
        assert.strictEqual(getRelSubject({}), '');
    });

    it('prefers subject_name over alternatives', () => {
        assert.strictEqual(getRelSubject({
            subject_name: 'First',
            source_name: 'Second',
            from: 'Third'
        }), 'First');
    });
});

// --- Utils.getRelObject ---
function getRelObject(rel) {
    return rel.object_name || rel.target_name || rel.to || '';
}

describe('Utils.getRelObject', () => {
    it('returns object_name when present', () => {
        assert.strictEqual(getRelObject({ object_name: 'Order' }), 'Order');
    });

    it('falls back to target_name', () => {
        assert.strictEqual(getRelObject({ target_name: 'Payment' }), 'Payment');
    });

    it('falls back to to', () => {
        assert.strictEqual(getRelObject({ to: 'Account' }), 'Account');
    });

    it('returns empty string when no field present', () => {
        assert.strictEqual(getRelObject({}), '');
    });
});

// --- Utils.getVerbPhrase ---
function getVerbPhrase(rel) {
    return (rel.verb_phrase || rel.forward_verb || '').trim();
}

describe('Utils.getVerbPhrase', () => {
    it('returns verb_phrase when present', () => {
        assert.strictEqual(getVerbPhrase({ verb_phrase: 'contains' }), 'contains');
    });

    it('falls back to forward_verb', () => {
        assert.strictEqual(getVerbPhrase({ forward_verb: 'has' }), 'has');
    });

    it('trims whitespace', () => {
        assert.strictEqual(getVerbPhrase({ verb_phrase: '  relates to  ' }), 'relates to');
    });

    it('returns empty string when no field present', () => {
        assert.strictEqual(getVerbPhrase({}), '');
    });
});

// --- Utils.getShortName ---
function getShortName(fullRef) {
    return fullRef.includes(':') ? fullRef.split(':').slice(1).join(':') : fullRef;
}

describe('Utils.getShortName', () => {
    it('removes first namespace from Schema.org reference', () => {
        assert.strictEqual(getShortName('Schema.org:Action'), 'Action');
    });

    it('preserves remaining namespaces from FIBO reference', () => {
        assert.strictEqual(getShortName('FIBO:FBC:Transaction'), 'FBC:Transaction');
    });

    it('returns unchanged if no colon', () => {
        assert.strictEqual(getShortName('Order'), 'Order');
    });

    it('handles deep namespaces', () => {
        assert.strictEqual(getShortName('A:B:C:D'), 'B:C:D');
    });
});

// --- Utils.toTitleCase ---
function toTitleCase(str) {
    if (!str) return '';
    return str.replace(/\b\w/g, c => c.toUpperCase());
}

describe('Utils.toTitleCase', () => {
    it('converts lowercase to title case', () => {
        assert.strictEqual(toTitleCase('income'), 'Income');
    });

    it('converts multi-word string to title case', () => {
        assert.strictEqual(toTitleCase('financial account'), 'Financial Account');
    });

    it('handles already capitalized strings', () => {
        assert.strictEqual(toTitleCase('Order'), 'Order');
    });

    it('handles mixed case strings', () => {
        assert.strictEqual(toTitleCase('fINANCIAL aCCOUNT'), 'FINANCIAL ACCOUNT');
    });

    it('returns empty string for null/undefined', () => {
        assert.strictEqual(toTitleCase(null), '');
        assert.strictEqual(toTitleCase(undefined), '');
        assert.strictEqual(toTitleCase(''), '');
    });

    it('handles hyphenated words', () => {
        assert.strictEqual(toTitleCase('cross-domain'), 'Cross-Domain');
    });

    it('handles strings with numbers', () => {
        assert.strictEqual(toTitleCase('order123'), 'Order123');
    });
});

// ============================================
// VIEWS TESTS
// ============================================

// --- Views.fileToViewId ---
function fileToViewId(file) {
    // Check for fragment notation: "domain:path#ViewName"
    if (file.includes('#')) {
        return file.split('#')[1];
    }

    // Legacy: Remove path if present
    const filename = file.split('/').pop();
    // BUG-012 FIX: Only remove known file extensions, preserve decimal numbers
    let viewId = filename.replace(/\.(json|cs|yaml|yml)$/i, '');

    // Strip common prefixes (only first match)
    const prefixes = [
        /^allininvestment[_-]/i,
        /^investment[_-]/i,
        /^financial[_-]/i,
        /^conceptspeak-training-/i,  // Training diagrams prefix
    ];
    for (const prefix of prefixes) {
        if (prefix.test(viewId)) {
            viewId = viewId.replace(prefix, '');
            break;
        }
    }

    return viewId;
}

describe('Views.fileToViewId', () => {
    it('extracts view from fragment notation', () => {
        assert.strictEqual(fileToViewId('Test#Payment'), 'Payment');
    });

    it('extracts view from domain path with fragment', () => {
        assert.strictEqual(fileToViewId('RBCZ:MIB:Investment#Financial Account'), 'Financial Account');
    });

    it('removes .cs extension', () => {
        assert.strictEqual(fileToViewId('Order.cs'), 'Order');
    });

    it('removes path and extension', () => {
        assert.strictEqual(fileToViewId('some/path/Order.cs'), 'Order');
    });

    it('strips Investment_ prefix', () => {
        assert.strictEqual(fileToViewId('Investment_Order.cs'), 'Order');
    });

    it('strips investment- prefix (case insensitive)', () => {
        assert.strictEqual(fileToViewId('investment-order.cs'), 'order');
    });

    it('strips AllInInvestment_ prefix', () => {
        assert.strictEqual(fileToViewId('AllInInvestment_Position.cs'), 'Position');
    });

    it('strips Financial_ prefix', () => {
        assert.strictEqual(fileToViewId('Financial_Account.cs'), 'Account');
    });

    it('only strips first matching prefix', () => {
        // Investment_ is stripped, but if there was another it wouldn't be
        assert.strictEqual(fileToViewId('Investment_Financial_Order.cs'), 'Financial_Order');
    });

    it('handles file without extension', () => {
        assert.strictEqual(fileToViewId('OrderView'), 'OrderView');
    });

    // BUG-012 regression tests: Preserve decimal numbers in view names
    it('preserves decimal in view name (BUG-012)', () => {
        assert.strictEqual(fileToViewId('Diagram 1.1'), 'Diagram 1.1');
    });

    it('preserves decimal when removing .json extension (BUG-012)', () => {
        assert.strictEqual(fileToViewId('Diagram 1.1.json'), 'Diagram 1.1');
    });

    it('preserves multiple decimals (BUG-012)', () => {
        assert.strictEqual(fileToViewId('Diagram 11.1'), 'Diagram 11.1');
    });

    it('strips training prefix and preserves decimal (BUG-012)', () => {
        assert.strictEqual(fileToViewId('conceptspeak-training-diagram-1.1.json'), 'diagram-1.1');
    });
});

// --- Views.viewIdToName ---
function viewIdToName(viewId) {
    let name = viewId;

    // Split camelCase (e.g., "FinancialAccount" → "Financial Account")
    name = name.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Replace separators with spaces
    name = name.replace(/[_-]/g, ' ');

    // Title case
    name = name.replace(/\b\w/g, c => c.toUpperCase());

    return name;
}

describe('Views.viewIdToName', () => {
    it('keeps simple name unchanged', () => {
        assert.strictEqual(viewIdToName('Order'), 'Order');
    });

    it('splits camelCase', () => {
        assert.strictEqual(viewIdToName('FinancialAccount'), 'Financial Account');
    });

    it('replaces underscores with spaces', () => {
        assert.strictEqual(viewIdToName('Financial_Account'), 'Financial Account');
    });

    it('replaces hyphens with spaces', () => {
        assert.strictEqual(viewIdToName('financial-account'), 'Financial Account');
    });

    it('handles mixed separators and camelCase', () => {
        assert.strictEqual(viewIdToName('myTest_ViewName'), 'My Test View Name');
    });

    it('title cases all words', () => {
        assert.strictEqual(viewIdToName('order'), 'Order');
    });
});

// --- Views.extractViews (stateful, needs mock-like setup) ---
describe('Views.extractViews', () => {
    // Create a minimal Views-like object for testing
    function createViewsInstance() {
        return {
            viewsMap: new Map(),
            conceptToViews: new Map(),
            activeView: null,
            fileToViewId,
            viewIdToName,
            extractViews(domainData) {
                this.viewsMap.clear();
                this.conceptToViews.clear();
                this.activeView = null;

                const concepts = domainData.concepts || [];
                const externalConcepts = domainData.external_concepts || [];
                const allConcepts = [...concepts, ...externalConcepts];

                allConcepts.forEach(concept => {
                    const sources = concept.sources || [];
                    sources.forEach(source => {
                        const file = source.file || '';
                        if (!file) return;

                        const viewId = this.fileToViewId(file);
                        const viewName = this.viewIdToName(viewId);

                        if (!this.viewsMap.has(viewId)) {
                            this.viewsMap.set(viewId, {
                                id: viewId,
                                name: viewName,
                                conceptNames: new Set()
                            });
                        }

                        this.viewsMap.get(viewId).conceptNames.add(concept.name);

                        if (!this.conceptToViews.has(concept.name)) {
                            this.conceptToViews.set(concept.name, new Set());
                        }
                        this.conceptToViews.get(concept.name).add(viewId);
                    });
                });

                return this.viewsMap;
            }
        };
    }

    it('extracts views from concepts with sources', () => {
        const views = createViewsInstance();
        const domainData = {
            concepts: [
                { name: 'Order', sources: [{ file: 'Test#Order' }] },
                { name: 'Payment', sources: [{ file: 'Test#Payment' }] }
            ]
        };

        views.extractViews(domainData);

        assert.strictEqual(views.viewsMap.size, 2);
        assert.ok(views.viewsMap.has('Order'));
        assert.ok(views.viewsMap.has('Payment'));
    });

    it('groups concepts by view', () => {
        const views = createViewsInstance();
        const domainData = {
            concepts: [
                { name: 'BuyOrder', sources: [{ file: 'Test#Order' }] },
                { name: 'SellOrder', sources: [{ file: 'Test#Order' }] },
                { name: 'Payment', sources: [{ file: 'Test#Payment' }] }
            ]
        };

        views.extractViews(domainData);

        assert.strictEqual(views.viewsMap.get('Order').conceptNames.size, 2);
        assert.ok(views.viewsMap.get('Order').conceptNames.has('BuyOrder'));
        assert.ok(views.viewsMap.get('Order').conceptNames.has('SellOrder'));
    });

    it('builds reverse mapping', () => {
        const views = createViewsInstance();
        const domainData = {
            concepts: [
                { name: 'Account', sources: [
                    { file: 'Test#Order' },
                    { file: 'Test#Payment' }
                ]}
            ]
        };

        views.extractViews(domainData);

        const conceptViews = views.conceptToViews.get('Account');
        assert.strictEqual(conceptViews.size, 2);
        assert.ok(conceptViews.has('Order'));
        assert.ok(conceptViews.has('Payment'));
    });

    it('includes external concepts', () => {
        const views = createViewsInstance();
        const domainData = {
            concepts: [
                { name: 'Order', sources: [{ file: 'Test#Order' }] }
            ],
            external_concepts: [
                { name: 'FIBOTransaction', sources: [{ file: 'Test#Order' }] }
            ]
        };

        views.extractViews(domainData);

        assert.ok(views.viewsMap.get('Order').conceptNames.has('FIBOTransaction'));
    });

    it('handles empty domain data', () => {
        const views = createViewsInstance();
        views.extractViews({});

        assert.strictEqual(views.viewsMap.size, 0);
    });

    it('skips concepts without sources', () => {
        const views = createViewsInstance();
        const domainData = {
            concepts: [
                { name: 'NoSource' },
                { name: 'WithSource', sources: [{ file: 'Test#View' }] }
            ]
        };

        views.extractViews(domainData);

        assert.strictEqual(views.viewsMap.size, 1);
    });

    it('resets state on each call', () => {
        const views = createViewsInstance();

        views.extractViews({ concepts: [{ name: 'A', sources: [{ file: 'Test#First' }] }] });
        assert.strictEqual(views.viewsMap.size, 1);

        views.extractViews({ concepts: [{ name: 'B', sources: [{ file: 'Test#Second' }] }] });
        assert.strictEqual(views.viewsMap.size, 1);
        assert.ok(views.viewsMap.has('Second'));
        assert.ok(!views.viewsMap.has('First'));
    });
});

// --- Views.isConceptInActiveView (BUG-003 regression test) ---
describe('Views.isConceptInActiveView', () => {
    function createViewsInstance() {
        return {
            activeView: null,
            conceptToViews: new Map(),
            isConceptInActiveView(conceptName) {
                if (!this.activeView) return true; // No view filter = show all
                const conceptViews = this.conceptToViews.get(conceptName);
                return !!(conceptViews && conceptViews.has(this.activeView));
            }
        };
    }

    it('returns true when no active view', () => {
        const views = createViewsInstance();
        assert.strictEqual(views.isConceptInActiveView('AnyConcept'), true);
    });

    it('returns true when concept belongs to active view', () => {
        const views = createViewsInstance();
        views.activeView = 'Order';
        views.conceptToViews.set('BuyOrder', new Set(['Order', 'Payment']));

        assert.strictEqual(views.isConceptInActiveView('BuyOrder'), true);
    });

    it('returns false when concept does not belong to active view', () => {
        const views = createViewsInstance();
        views.activeView = 'Payment';
        views.conceptToViews.set('BuyOrder', new Set(['Order']));

        assert.strictEqual(views.isConceptInActiveView('BuyOrder'), false);
    });

    it('returns false when concept not in any view', () => {
        const views = createViewsInstance();
        views.activeView = 'Order';

        assert.strictEqual(views.isConceptInActiveView('UnknownConcept'), false);
    });

    // BUG-003 regression test: Must use display name, not qname
    it('uses display name not qname for lookup (BUG-003)', () => {
        const views = createViewsInstance();
        views.activeView = 'DP_EDI_AUM';

        // Concept keyed by DISPLAY NAME (not qname)
        views.conceptToViews.set('EDI AUM', new Set(['DP_EDI_AUM']));

        // Must use display name "EDI AUM", NOT qname "Investment:EDI_AUM"
        assert.strictEqual(views.isConceptInActiveView('EDI AUM'), true);
        assert.strictEqual(views.isConceptInActiveView('Investment:EDI_AUM'), false);
    });

    it('handles concepts in multiple views', () => {
        const views = createViewsInstance();
        views.activeView = 'Order';
        views.conceptToViews.set('Account', new Set(['Order', 'Payment', 'Position']));

        assert.strictEqual(views.isConceptInActiveView('Account'), true);

        views.activeView = 'Payment';
        assert.strictEqual(views.isConceptInActiveView('Account'), true);

        views.activeView = 'Transaction';
        assert.strictEqual(views.isConceptInActiveView('Account'), false);
    });
});

// ============================================
// GRAPH TESTS
// ============================================

// --- Graph.buildParentChildMap ---
function buildParentChildMap(domainData) {
    const map = new Map();
    const subsumptions = domainData.subsumptions || [];

    subsumptions.forEach(sub => {
        const child = sub.child_name || sub.child?.name;
        const parent = sub.parent_name || sub.parent?.name;
        if (!child || !parent) return;

        if (!map.has(parent)) {
            map.set(parent, []);
        }
        map.get(parent).push(child);
    });

    return map;
}

describe('Graph.buildParentChildMap', () => {
    it('builds map from flat format subsumptions', () => {
        const domainData = {
            subsumptions: [
                { child_name: 'Order', parent_name: 'Transaction' },
                { child_name: 'Payment', parent_name: 'Transaction' },
                { child_name: 'BuyOrder', parent_name: 'Order' }
            ]
        };

        const map = buildParentChildMap(domainData);

        assert.deepStrictEqual(map.get('Transaction'), ['Order', 'Payment']);
        assert.deepStrictEqual(map.get('Order'), ['BuyOrder']);
        assert.strictEqual(map.has('Payment'), false);
        assert.strictEqual(map.has('BuyOrder'), false);
    });

    it('builds map from nested format subsumptions', () => {
        const domainData = {
            subsumptions: [
                { child: { name: 'Account' }, parent: { name: 'Asset' } },
                { child: { name: 'SavingsAccount' }, parent: { name: 'Account' } }
            ]
        };

        const map = buildParentChildMap(domainData);

        assert.deepStrictEqual(map.get('Asset'), ['Account']);
        assert.deepStrictEqual(map.get('Account'), ['SavingsAccount']);
    });

    it('handles mixed format subsumptions', () => {
        const domainData = {
            subsumptions: [
                { child_name: 'A', parent_name: 'Root' },
                { child: { name: 'B' }, parent: { name: 'Root' } }
            ]
        };

        const map = buildParentChildMap(domainData);

        assert.deepStrictEqual(map.get('Root'), ['A', 'B']);
    });

    it('returns empty map when no subsumptions', () => {
        const map1 = buildParentChildMap({});
        const map2 = buildParentChildMap({ subsumptions: [] });

        assert.strictEqual(map1.size, 0);
        assert.strictEqual(map2.size, 0);
    });

    it('skips malformed entries', () => {
        const domainData = {
            subsumptions: [
                { child_name: 'Valid', parent_name: 'Parent' },
                { child_name: 'NoParent' },
                { parent_name: 'NoChild' },
                {},
                { child_name: null, parent_name: 'Parent' }
            ]
        };

        const map = buildParentChildMap(domainData);

        assert.strictEqual(map.size, 1);
        assert.deepStrictEqual(map.get('Parent'), ['Valid']);
    });

    it('handles multiple children for same parent', () => {
        const domainData = {
            subsumptions: [
                { child_name: 'Child1', parent_name: 'Parent' },
                { child_name: 'Child2', parent_name: 'Parent' },
                { child_name: 'Child3', parent_name: 'Parent' }
            ]
        };

        const map = buildParentChildMap(domainData);

        assert.strictEqual(map.get('Parent').length, 3);
        assert.deepStrictEqual(map.get('Parent'), ['Child1', 'Child2', 'Child3']);
    });

    it('handles deep hierarchy', () => {
        const domainData = {
            subsumptions: [
                { child_name: 'Level1', parent_name: 'Root' },
                { child_name: 'Level2', parent_name: 'Level1' },
                { child_name: 'Level3', parent_name: 'Level2' },
                { child_name: 'Level4', parent_name: 'Level3' }
            ]
        };

        const map = buildParentChildMap(domainData);

        assert.deepStrictEqual(map.get('Root'), ['Level1']);
        assert.deepStrictEqual(map.get('Level1'), ['Level2']);
        assert.deepStrictEqual(map.get('Level2'), ['Level3']);
        assert.deepStrictEqual(map.get('Level3'), ['Level4']);
    });
});

// --- buildNameToQname (BUG-004, BUG-005 regression tests) ---
// Simulates the nameToQname map building logic from graph.js
function buildNameToQname(concepts, externalConcepts) {
    const nameToQname = new Map();

    // First: add domain concepts
    concepts.forEach(c => {
        if (c.qname) {
            nameToQname.set(c.name, c.qname);
        }
    });

    // Second: add external concepts (only if not already in domain)
    externalConcepts.forEach(ext => {
        if (ext.qname && !nameToQname.has(ext.name)) {
            nameToQname.set(ext.name, ext.qname);
        }
    });

    return nameToQname;
}

describe('buildNameToQname', () => {
    it('maps domain concept names to qnames', () => {
        const concepts = [
            { name: 'Order', qname: 'bkb-test:Order' },
            { name: 'Payment', qname: 'bkb-test:Payment' }
        ];
        const map = buildNameToQname(concepts, []);

        assert.strictEqual(map.get('Order'), 'bkb-test:Order');
        assert.strictEqual(map.get('Payment'), 'bkb-test:Payment');
    });

    it('adds external concepts when no domain collision', () => {
        const concepts = [
            { name: 'Order', qname: 'bkb-test:Order' }
        ];
        const externalConcepts = [
            { name: 'Action', qname: 'schema:Action' }
        ];
        const map = buildNameToQname(concepts, externalConcepts);

        assert.strictEqual(map.get('Order'), 'bkb-test:Order');
        assert.strictEqual(map.get('Action'), 'schema:Action');
    });

    // BUG-005 regression test: Domain concepts must not be overwritten by external
    it('preserves domain concept when external has same name (BUG-005)', () => {
        const concepts = [
            { name: 'Date', qname: 'bkb-test:Date' }  // Domain concept
        ];
        const externalConcepts = [
            { name: 'Date', qname: 'omg-dat:Date' }   // External FIBO concept
        ];
        const map = buildNameToQname(concepts, externalConcepts);

        // Domain concept qname must be preserved, NOT overwritten by external
        assert.strictEqual(map.get('Date'), 'bkb-test:Date');
        assert.notStrictEqual(map.get('Date'), 'omg-dat:Date');
    });

    // BUG-004 regression test: No duplicates in output
    it('does not create duplicate entries for same-name concepts (BUG-004)', () => {
        const concepts = [
            { name: 'ISIN', qname: 'bkb-test:ISIN' }
        ];
        const externalConcepts = [
            { name: 'ISIN', qname: 'fibo-sec:ISIN' }
        ];
        const map = buildNameToQname(concepts, externalConcepts);

        // Only one entry for "ISIN"
        assert.strictEqual(map.size, 1);
        assert.strictEqual(map.get('ISIN'), 'bkb-test:ISIN');
    });

    it('handles concepts without qname', () => {
        const concepts = [
            { name: 'NoQname' },
            { name: 'HasQname', qname: 'bkb-test:HasQname' }
        ];
        const map = buildNameToQname(concepts, []);

        assert.strictEqual(map.has('NoQname'), false);
        assert.strictEqual(map.get('HasQname'), 'bkb-test:HasQname');
    });
});

// --- shouldShowPropertyType (BUG-006 regression test) ---
// Simulates the property-type visibility logic from graph.js
function shouldShowPropertyType(typeName, properties, isConceptInActiveView) {
    return properties.some(prop => {
        const propType = prop.propertyType;
        const propParent = prop.parentConcept;
        return propType === typeName &&
               propParent &&
               isConceptInActiveView(propParent);
    });
}

describe('shouldShowPropertyType', () => {
    it('returns true when property parent is in active view', () => {
        const properties = [
            { propertyType: 'Country Code', parentConcept: 'EDI AUM' }
        ];
        const isInView = (name) => name === 'EDI AUM';

        assert.strictEqual(shouldShowPropertyType('Country Code', properties, isInView), true);
    });

    it('returns false when property parent is not in active view', () => {
        const properties = [
            { propertyType: 'Country Code', parentConcept: 'EDI AUM' }
        ];
        const isInView = (name) => name === 'Transaction';

        assert.strictEqual(shouldShowPropertyType('Country Code', properties, isInView), false);
    });

    // BUG-006 regression test: Property-type must check ALL properties using it
    it('returns true if ANY property parent is in view (BUG-006)', () => {
        const properties = [
            { propertyType: 'Country Code', parentConcept: 'EDI AUM' },        // Not in view
            { propertyType: 'Country Code', parentConcept: 'IDM Country' },   // Not in view
            { propertyType: 'Country Code', parentConcept: 'Account' }         // In view!
        ];
        const isInView = (name) => name === 'Account';

        assert.strictEqual(shouldShowPropertyType('Country Code', properties, isInView), true);
    });

    it('returns false when no properties use the type', () => {
        const properties = [
            { propertyType: 'String', parentConcept: 'Order' }
        ];
        const isInView = () => true;

        assert.strictEqual(shouldShowPropertyType('Country Code', properties, isInView), false);
    });

    it('returns false when property has no parent concept', () => {
        const properties = [
            { propertyType: 'Country Code', parentConcept: null }
        ];
        const isInView = () => true;

        assert.strictEqual(shouldShowPropertyType('Country Code', properties, isInView), false);
    });

    it('handles empty properties array', () => {
        const isInView = () => true;

        assert.strictEqual(shouldShowPropertyType('AnyType', [], isInView), false);
    });
});

// --- BUG-009 regression tests: QName-based view membership ---
// Views now use qname (not name) to identify concepts, preventing name collisions
describe('Views qname-based membership (BUG-009)', () => {
    // Create a Views instance that uses QNAME for identification (post-BUG-009 fix)
    function createQnameViewsInstance() {
        return {
            viewsMap: new Map(),
            conceptToViews: new Map(),  // Key is QNAME, not name
            activeView: null,
            fileToViewId,
            viewIdToName,
            extractViews(domainData) {
                this.viewsMap.clear();
                this.conceptToViews.clear();
                this.activeView = null;

                const concepts = domainData.concepts || [];
                const externalConcepts = domainData.external_concepts || [];
                const allConcepts = [...concepts, ...externalConcepts];

                allConcepts.forEach(concept => {
                    const sources = concept.sources || [];
                    sources.forEach(source => {
                        const file = source.file || '';
                        if (!file) return;

                        const viewId = this.fileToViewId(file);
                        const viewName = this.viewIdToName(viewId);

                        if (!this.viewsMap.has(viewId)) {
                            this.viewsMap.set(viewId, {
                                id: viewId,
                                name: viewName,
                                conceptQnames: new Set()  // BUG-009: Use qnames
                            });
                        }

                        // BUG-009: Use qname for unique identification
                        const conceptQname = concept.qname || concept.name;
                        this.viewsMap.get(viewId).conceptQnames.add(conceptQname);

                        // BUG-009: Key by qname, not name
                        if (!this.conceptToViews.has(conceptQname)) {
                            this.conceptToViews.set(conceptQname, new Set());
                        }
                        this.conceptToViews.get(conceptQname).add(viewId);
                    });
                });

                return this.viewsMap;
            },
            getConceptsInView(viewId) {
                const view = this.viewsMap.get(viewId);
                return view ? view.conceptQnames : new Set();
            },
            isConceptInActiveView(conceptQname) {
                if (!this.activeView) return true;
                const conceptViews = this.conceptToViews.get(conceptQname);
                return !!(conceptViews && conceptViews.has(this.activeView));
            }
        };
    }

    // BUG-009 core regression test: Same name, different qname = different concepts
    it('treats concepts with same name but different qnames as distinct (BUG-009)', () => {
        const views = createQnameViewsInstance();
        const domainData = {
            concepts: [
                // Domain "Date" concept from Position view
                { name: 'Date', qname: 'bkb-test:Date', sources: [{ file: 'Test#Position' }] }
            ],
            external_concepts: [
                // External FIBO "Date" concept referenced from DP_EDI_AUM view
                { name: 'Date', qname: 'omg-dat:Date', sources: [{ file: 'Test#DP_EDI_AUM' }] }
            ]
        };

        views.extractViews(domainData);

        // Both should be tracked separately by qname
        const positionConcepts = views.getConceptsInView('Position');
        const dpEdiAumConcepts = views.getConceptsInView('DP_EDI_AUM');

        assert.ok(positionConcepts.has('bkb-test:Date'), 'Position should contain bkb-test:Date');
        assert.ok(!positionConcepts.has('omg-dat:Date'), 'Position should NOT contain omg-dat:Date');
        assert.ok(dpEdiAumConcepts.has('omg-dat:Date'), 'DP_EDI_AUM should contain omg-dat:Date');
        assert.ok(!dpEdiAumConcepts.has('bkb-test:Date'), 'DP_EDI_AUM should NOT contain bkb-test:Date');
    });

    it('prevents ghost detection false positives from name collision (BUG-009)', () => {
        const views = createQnameViewsInstance();
        const domainData = {
            concepts: [
                { name: 'Date', qname: 'bkb-test:Date', sources: [{ file: 'Test#Position' }] },
                { name: 'Trade Date', qname: 'bkb-test:Trade Date', sources: [{ file: 'Test#Position' }] },
                { name: 'Calendar Day', qname: 'bkb-test:Calendar Day', sources: [{ file: 'Test#DP_EDI_AUM' }] }
            ],
            external_concepts: [
                { name: 'Date', qname: 'omg-dat:Date', sources: [{ file: 'Test#DP_EDI_AUM' }] }
            ]
        };

        views.extractViews(domainData);
        views.activeView = 'DP_EDI_AUM';

        // Simulate ghost detection logic
        // A concept should only be considered "in view" if its QNAME is in the active view
        const activeViewQnames = views.getConceptsInView('DP_EDI_AUM');

        // Calendar Day is in DP_EDI_AUM (by qname)
        assert.strictEqual(views.isConceptInActiveView('bkb-test:Calendar Day'), true);

        // omg-dat:Date is in DP_EDI_AUM (external, by qname)
        assert.strictEqual(views.isConceptInActiveView('omg-dat:Date'), true);

        // bkb-test:Date is NOT in DP_EDI_AUM (it's in Position) - THIS IS THE BUG FIX
        assert.strictEqual(views.isConceptInActiveView('bkb-test:Date'), false);

        // Trade Date is NOT in DP_EDI_AUM
        assert.strictEqual(views.isConceptInActiveView('bkb-test:Trade Date'), false);
    });

    it('uses qname for reverse mapping lookup', () => {
        const views = createQnameViewsInstance();
        const domainData = {
            concepts: [
                { name: 'Order', qname: 'bkb-test:Order', sources: [
                    { file: 'Test#Order' },
                    { file: 'Test#Payment' }
                ]}
            ]
        };

        views.extractViews(domainData);

        // Lookup by qname should work
        const orderViews = views.conceptToViews.get('bkb-test:Order');
        assert.ok(orderViews, 'Should find views for bkb-test:Order');
        assert.strictEqual(orderViews.size, 2);
        assert.ok(orderViews.has('Order'));
        assert.ok(orderViews.has('Payment'));

        // Lookup by name alone should NOT work
        const nameOnlyViews = views.conceptToViews.get('Order');
        assert.strictEqual(nameOnlyViews, undefined, 'Should NOT find views by name alone');
    });

    it('handles concepts without qname by using name as fallback', () => {
        const views = createQnameViewsInstance();
        const domainData = {
            concepts: [
                { name: 'LegacyConcept', sources: [{ file: 'Test#Order' }] }  // No qname
            ]
        };

        views.extractViews(domainData);

        // Should use name as fallback qname
        const orderConcepts = views.getConceptsInView('Order');
        assert.ok(orderConcepts.has('LegacyConcept'), 'Should use name as fallback');
    });
});

// --- Ghost detection helper (BUG-009) ---
// Simulates the isInActiveView helper from graph.js post-fix
function createGhostDetectionHelper(nameToQname, activeViewQnames) {
    return (name) => {
        const qname = nameToQname.get(name);
        return qname && activeViewQnames.has(qname);
    };
}

describe('Ghost detection with qname lookup (BUG-009)', () => {
    it('correctly identifies concepts in active view by qname', () => {
        const nameToQname = new Map([
            ['Calendar Day', 'bkb-test:Calendar Day'],
            ['Date', 'bkb-test:Date']  // Domain Date from Position
        ]);
        const activeViewQnames = new Set([
            'bkb-test:Calendar Day',
            'omg-dat:Date'  // External Date in DP_EDI_AUM
        ]);

        const isInActiveView = createGhostDetectionHelper(nameToQname, activeViewQnames);

        // Calendar Day is in active view
        assert.strictEqual(isInActiveView('Calendar Day'), true);

        // "Date" resolves to bkb-test:Date which is NOT in active view
        // (omg-dat:Date is in view, but "Date" name maps to bkb-test:Date)
        assert.strictEqual(isInActiveView('Date'), false);
    });

    it('returns false for unknown concepts', () => {
        const nameToQname = new Map();
        const activeViewQnames = new Set(['bkb-test:Order']);

        const isInActiveView = createGhostDetectionHelper(nameToQname, activeViewQnames);

        // Returns falsy (undefined) when concept not in nameToQname map
        assert.strictEqual(!!isInActiveView('Unknown'), false);
    });
});

// ============================================
// BUG-010 REGRESSION TESTS
// Toggle counts must respect active view filter
// ============================================

// --- BUG-010: getFilterCounts view-aware counting ---
// Simulates the counting logic from graph.js getFilterCounts()
function createFilterCountsHelper(options = {}) {
    const { activeView = null, conceptToViews = new Map() } = options;

    // Simulate Views.isConceptInActiveView
    const isConceptInActiveView = (qname) => {
        if (!activeView) return true;
        const views = conceptToViews.get(qname);
        return !!(views && views.has(activeView));
    };

    // Simulate isInView helper from getFilterCounts
    const isInView = (qname) => {
        if (!activeView) return true;
        return isConceptInActiveView(qname);
    };

    return {
        activeView,
        isInView,
        countNodes(nodes) {
            const counts = { domain: 0, fibo: 0, schema: 0, context: 0, primitive: 0 };

            nodes.forEach(node => {
                // Skip junction nodes
                if (node.classes.includes('junction')) return;

                // BUG-010: Skip property and property-type nodes
                if (node.classes.includes('property') || node.classes.includes('property-type')) {
                    return;
                }

                const qname = node.qname || node.name;

                // Count primitive types
                if (node.classes.includes('primitive')) {
                    if (isInView(qname)) counts.primitive++;
                    return;
                }

                // External nodes
                if (node.classes.includes('external')) {
                    if (!isInView(qname)) return;
                    if (node.source === 'Schema.org') {
                        counts.schema++;
                    } else if (node.source === 'FIBO' || node.source === 'OMG Commons') {
                        // BUG-010: OMG Commons counts under FIBO
                        counts.fibo++;
                    }
                    return;
                }

                // Skip nodes not in view
                if (!isInView(qname)) return;

                // Domain concepts
                if (node.classes.includes('context')) {
                    counts.context++;
                } else {
                    counts.domain++;
                }
            });

            return counts;
        },
        countEdges(edges, nodes) {
            let count = 0;

            // Build node lookup
            const nodeByQname = new Map();
            nodes.forEach(n => nodeByQname.set(n.qname || n.name, n));

            edges.forEach(edge => {
                // BUG-010: Skip edges where NEITHER endpoint is in view
                if (activeView) {
                    const srcInView = isInView(edge.source);
                    const tgtInView = isInView(edge.target);
                    if (!srcInView && !tgtInView) return;
                }
                count++;
            });

            return count;
        }
    };
}

describe('BUG-010: getFilterCounts view filtering', () => {
    // BUG-010 core regression test: Counts must filter by active view
    it('counts only nodes in active view (BUG-010)', () => {
        const conceptToViews = new Map([
            ['bkb-test:Order', new Set(['Order'])],
            ['bkb-test:Payment', new Set(['Payment'])],
            ['bkb-test:Account', new Set(['Order', 'Payment'])]  // In both
        ]);

        const nodes = [
            { name: 'Order', qname: 'bkb-test:Order', classes: ['explicit-domain'] },
            { name: 'Payment', qname: 'bkb-test:Payment', classes: ['explicit-domain'] },
            { name: 'Account', qname: 'bkb-test:Account', classes: ['explicit-domain'] }
        ];

        // No view filter - count all
        const helper1 = createFilterCountsHelper({ activeView: null, conceptToViews });
        const counts1 = helper1.countNodes(nodes);
        assert.strictEqual(counts1.domain, 3, 'Should count all 3 when no view filter');

        // Order view - count only Order and Account
        const helper2 = createFilterCountsHelper({ activeView: 'Order', conceptToViews });
        const counts2 = helper2.countNodes(nodes);
        assert.strictEqual(counts2.domain, 2, 'Order view should have 2 nodes');

        // Payment view - count only Payment and Account
        const helper3 = createFilterCountsHelper({ activeView: 'Payment', conceptToViews });
        const counts3 = helper3.countNodes(nodes);
        assert.strictEqual(counts3.domain, 2, 'Payment view should have 2 nodes');
    });

    // BUG-010 regression: DP EDI AUM example from bug report
    it('reproduces BUG-010 scenario: DP EDI AUM view counts (BUG-010)', () => {
        // Simulates the DP EDI AUM view with 24 concepts
        // Domain: 18, FIBO: 6 (per bug report "Verified Results")
        const conceptToViews = new Map([
            // 18 domain concepts in DP_EDI_AUM
            ['bkb-test:EDI_AUM', new Set(['DP_EDI_AUM'])],
            ['bkb-test:Fund', new Set(['DP_EDI_AUM'])],
            ['bkb-test:Portfolio', new Set(['DP_EDI_AUM'])],
            ['bkb-test:NAV', new Set(['DP_EDI_AUM'])],
            // ... simulating 18 domain concepts
            // 6 FIBO external concepts in DP_EDI_AUM
            ['fibo:Account', new Set(['DP_EDI_AUM'])],
            ['fibo:FinancialInstrument', new Set(['DP_EDI_AUM'])],
            // Concepts NOT in DP_EDI_AUM (from other views)
            ['bkb-test:Order', new Set(['Order'])],
            ['bkb-test:Trade', new Set(['Order'])],
            ['fibo:Transaction', new Set(['Transaction'])]
        ]);

        const nodes = [
            // DP_EDI_AUM domain concepts (simulating 18)
            { name: 'EDI_AUM', qname: 'bkb-test:EDI_AUM', classes: ['explicit-domain'] },
            { name: 'Fund', qname: 'bkb-test:Fund', classes: ['explicit-domain'] },
            { name: 'Portfolio', qname: 'bkb-test:Portfolio', classes: ['explicit-domain'] },
            { name: 'NAV', qname: 'bkb-test:NAV', classes: ['explicit-domain'] },
            // DP_EDI_AUM FIBO externals (simulating 6)
            { name: 'Account', qname: 'fibo:Account', classes: ['external'], source: 'FIBO' },
            { name: 'FinancialInstrument', qname: 'fibo:FinancialInstrument', classes: ['external'], source: 'FIBO' },
            // Other views (should NOT be counted)
            { name: 'Order', qname: 'bkb-test:Order', classes: ['explicit-domain'] },
            { name: 'Trade', qname: 'bkb-test:Trade', classes: ['explicit-domain'] },
            { name: 'Transaction', qname: 'fibo:Transaction', classes: ['external'], source: 'FIBO' }
        ];

        // With DP_EDI_AUM view active
        const helper = createFilterCountsHelper({ activeView: 'DP_EDI_AUM', conceptToViews });
        const counts = helper.countNodes(nodes);

        // Should only count nodes IN the view
        assert.strictEqual(counts.domain, 4, 'Should count only domain nodes in DP_EDI_AUM view');
        assert.strictEqual(counts.fibo, 2, 'Should count only FIBO nodes in DP_EDI_AUM view');

        // Total should NOT include Order, Trade, Transaction
        const total = counts.domain + counts.fibo;
        assert.strictEqual(total, 6, 'Total should be domain + fibo in view');
    });

    it('excludes property and property-type nodes from counts (BUG-010)', () => {
        const nodes = [
            { name: 'Order', qname: 'bkb-test:Order', classes: ['explicit-domain'] },
            { name: 'orderId', qname: 'bkb-test:orderId', classes: ['property'] },
            { name: 'String', qname: 'xsd:String', classes: ['property-type', 'primitive'] },
            { name: 'CountryCode', qname: 'bkb-test:CountryCode', classes: ['property-type'] }
        ];

        const helper = createFilterCountsHelper({ activeView: null });
        const counts = helper.countNodes(nodes);

        // Only Order should be counted as domain
        assert.strictEqual(counts.domain, 1, 'Properties should NOT be counted under domain');
        assert.strictEqual(counts.primitive, 0, 'property-type primitives excluded from count');
    });

    it('counts OMG Commons as FIBO (BUG-010)', () => {
        const nodes = [
            { name: 'Date', qname: 'omg-dat:Date', classes: ['external'], source: 'OMG Commons' },
            { name: 'Quantity', qname: 'cmns-qtu:Quantity', classes: ['external'], source: 'OMG Commons' },
            { name: 'Account', qname: 'fibo:Account', classes: ['external'], source: 'FIBO' },
            { name: 'Action', qname: 'schema:Action', classes: ['external'], source: 'Schema.org' }
        ];

        const helper = createFilterCountsHelper({ activeView: null });
        const counts = helper.countNodes(nodes);

        // OMG Commons should count under FIBO toggle
        assert.strictEqual(counts.fibo, 3, 'OMG Commons + FIBO should total 3');
        assert.strictEqual(counts.schema, 1, 'Schema.org should be 1');
    });

    it('counts edges with at least one endpoint in view (BUG-010)', () => {
        const conceptToViews = new Map([
            ['bkb-test:Order', new Set(['Order'])],
            ['bkb-test:Payment', new Set(['Payment'])],
            ['bkb-test:Account', new Set(['Order', 'Payment'])],
            ['bkb-test:Transaction', new Set(['Transaction'])]
        ]);

        const nodes = [
            { name: 'Order', qname: 'bkb-test:Order' },
            { name: 'Payment', qname: 'bkb-test:Payment' },
            { name: 'Account', qname: 'bkb-test:Account' },
            { name: 'Transaction', qname: 'bkb-test:Transaction' }
        ];

        const edges = [
            { source: 'bkb-test:Order', target: 'bkb-test:Account' },        // Both in Order view
            { source: 'bkb-test:Payment', target: 'bkb-test:Account' },      // Account in Order view
            { source: 'bkb-test:Payment', target: 'bkb-test:Transaction' }   // NEITHER in Order view
        ];

        // No view filter - count all
        const helper1 = createFilterCountsHelper({ activeView: null, conceptToViews });
        assert.strictEqual(helper1.countEdges(edges, nodes), 3, 'All edges counted when no view');

        // Order view: Order→Account (both), Payment→Account (Account in view), NOT Payment→Transaction
        const helper2 = createFilterCountsHelper({ activeView: 'Order', conceptToViews });
        assert.strictEqual(helper2.countEdges(edges, nodes), 2, 'Skip edges where NEITHER endpoint in view');
    });
});

// --- BUG-010: Property parent visibility ---
// Simulates property visibility logic from applyFilter
function createPropertyVisibilityHelper(options = {}) {
    const {
        activeView = null,
        conceptToViews = new Map(),
        showDomain = true,
        showContext = true
    } = options;

    const isConceptInActiveView = (qname) => {
        if (!activeView) return true;
        const views = conceptToViews.get(qname);
        return !!(views && views.has(activeView));
    };

    return {
        isPropertyVisible(property, parentNode) {
            // BUG-010: Property follows parent visibility
            const parentQname = property.parentConceptQname;

            if (!parentNode) return false;

            // Check parent's toggle state
            const parentIsContext = parentNode.classes.includes('context');
            const parentIsDomain = !parentNode.classes.includes('external') && !parentIsContext;

            if (parentIsContext && !showContext) return false;
            if (parentIsDomain && !showDomain) return false;

            // Check view filter
            if (activeView && parentQname) {
                if (!isConceptInActiveView(parentQname)) return false;
            }

            return true;
        },
        isPropertyTypeVisible(typeName, properties, parentNodes) {
            // BUG-010: Property-type visible if ANY using property has visible parent
            return properties.some(prop => {
                if (prop.propertyType !== typeName) return false;

                const parentQname = prop.parentConceptQname;
                const parentNode = parentNodes.get(parentQname);
                if (!parentNode) return false;

                return this.isPropertyVisible(prop, parentNode);
            });
        }
    };
}

describe('BUG-010: Property parent visibility', () => {
    it('hides property when parent domain toggle is off (BUG-010)', () => {
        const helper = createPropertyVisibilityHelper({
            showDomain: false,
            showContext: true
        });

        const property = { parentConceptQname: 'bkb-test:Order' };
        const parentNode = { classes: ['explicit-domain'] };

        assert.strictEqual(
            helper.isPropertyVisible(property, parentNode),
            false,
            'Property should be hidden when parent domain toggle is off'
        );
    });

    it('shows property when parent domain toggle is on (BUG-010)', () => {
        const helper = createPropertyVisibilityHelper({
            showDomain: true,
            showContext: true
        });

        const property = { parentConceptQname: 'bkb-test:Order' };
        const parentNode = { classes: ['explicit-domain'] };

        assert.strictEqual(
            helper.isPropertyVisible(property, parentNode),
            true,
            'Property should be visible when parent domain toggle is on'
        );
    });

    it('hides property when parent not in active view (BUG-010)', () => {
        const conceptToViews = new Map([
            ['bkb-test:Order', new Set(['Order'])]
        ]);

        const helper = createPropertyVisibilityHelper({
            activeView: 'Payment',  // Different view
            conceptToViews,
            showDomain: true
        });

        const property = { parentConceptQname: 'bkb-test:Order' };
        const parentNode = { classes: ['explicit-domain'] };

        assert.strictEqual(
            helper.isPropertyVisible(property, parentNode),
            false,
            'Property should be hidden when parent not in active view'
        );
    });

    it('shows property-type when ANY property parent is visible (BUG-010)', () => {
        const conceptToViews = new Map([
            ['bkb-test:Order', new Set(['Order'])],
            ['bkb-test:Payment', new Set(['Payment'])]
        ]);

        const helper = createPropertyVisibilityHelper({
            activeView: 'Order',
            conceptToViews,
            showDomain: true
        });

        const properties = [
            { propertyType: 'CountryCode', parentConceptQname: 'bkb-test:Payment' },  // NOT in view
            { propertyType: 'CountryCode', parentConceptQname: 'bkb-test:Order' }     // In view!
        ];

        const parentNodes = new Map([
            ['bkb-test:Order', { classes: ['explicit-domain'] }],
            ['bkb-test:Payment', { classes: ['explicit-domain'] }]
        ]);

        assert.strictEqual(
            helper.isPropertyTypeVisible('CountryCode', properties, parentNodes),
            true,
            'Property-type visible when ANY using property parent is visible'
        );
    });

    it('hides property-type when NO property parent is visible (BUG-010)', () => {
        const conceptToViews = new Map([
            ['bkb-test:Order', new Set(['Order'])],
            ['bkb-test:Payment', new Set(['Payment'])]
        ]);

        const helper = createPropertyVisibilityHelper({
            activeView: 'Transaction',  // Neither Order nor Payment
            conceptToViews,
            showDomain: true
        });

        const properties = [
            { propertyType: 'CountryCode', parentConceptQname: 'bkb-test:Payment' },
            { propertyType: 'CountryCode', parentConceptQname: 'bkb-test:Order' }
        ];

        const parentNodes = new Map([
            ['bkb-test:Order', { classes: ['explicit-domain'] }],
            ['bkb-test:Payment', { classes: ['explicit-domain'] }]
        ]);

        assert.strictEqual(
            helper.isPropertyTypeVisible('CountryCode', properties, parentNodes),
            false,
            'Property-type hidden when NO using property parent is visible'
        );
    });

    it('handles context concept parents (BUG-010)', () => {
        const helper = createPropertyVisibilityHelper({
            showDomain: true,
            showContext: false  // Context toggle OFF
        });

        const property = { parentConceptQname: 'bkb-test:Client' };
        const parentNode = { classes: ['context'] };

        assert.strictEqual(
            helper.isPropertyVisible(property, parentNode),
            false,
            'Property hidden when context parent toggle is off'
        );

        // Toggle context on
        const helper2 = createPropertyVisibilityHelper({
            showDomain: true,
            showContext: true
        });

        assert.strictEqual(
            helper2.isPropertyVisible(property, parentNode),
            true,
            'Property visible when context parent toggle is on'
        );
    });
});

// ============================================
// BUG-013 REGRESSION TESTS
// has-property and has-type edges must be highlighted on hover/click
// ============================================

// Simulates the edge type check in highlightNode() and highlightConnected()
function isEdgeTypeHighlighted(type) {
    // This mirrors the condition in graph.js highlightNode/highlightConnected:
    // } else if (type === 'relationship' || type === 'isA' || type === 'subsumption' || type === 'transitive' || type === 'has-property' || type === 'has-type') {
    return type === 'relationship' ||
           type === 'isA' ||
           type === 'subsumption' ||
           type === 'transitive' ||
           type === 'has-property' ||
           type === 'has-type';
}

describe('BUG-013: has-property/has-type highlight', () => {
    it('highlights relationship edges (baseline)', () => {
        assert.strictEqual(isEdgeTypeHighlighted('relationship'), true);
    });

    it('highlights isA edges (baseline)', () => {
        assert.strictEqual(isEdgeTypeHighlighted('isA'), true);
    });

    it('highlights subsumption edges (baseline)', () => {
        assert.strictEqual(isEdgeTypeHighlighted('subsumption'), true);
    });

    it('highlights transitive edges (baseline)', () => {
        assert.strictEqual(isEdgeTypeHighlighted('transitive'), true);
    });

    it('highlights has-property edges (BUG-013 fix)', () => {
        assert.strictEqual(
            isEdgeTypeHighlighted('has-property'),
            true,
            'has-property edges must be highlighted on node hover/click'
        );
    });

    it('highlights has-type edges (BUG-013 fix)', () => {
        assert.strictEqual(
            isEdgeTypeHighlighted('has-type'),
            true,
            'has-type edges must be highlighted on node hover/click'
        );
    });

    it('does not highlight trunk edges (categorization, handled separately)', () => {
        assert.strictEqual(isEdgeTypeHighlighted('trunk'), false);
    });

    it('does not highlight branch edges (categorization, handled separately)', () => {
        assert.strictEqual(isEdgeTypeHighlighted('branch'), false);
    });
});

// ============================================
// BUG-015 REGRESSION TESTS
// FIBO external node definition lookup case mismatch
// ============================================

/**
 * Simulates fiboDefinitionMap building and lookup from graph.js
 * Map is built from fibo_mapping.label (lowercase in data)
 * Lookup uses label which may be titlecase
 */
function buildFiboDefinitionMap(concepts) {
    const map = new Map();
    concepts.forEach(concept => {
        const fiboMapping = concept.fibo_mapping;
        if (fiboMapping && fiboMapping.label) {
            // BUG-015 FIX: Normalize to lowercase
            const fiboParent = `FIBO:${fiboMapping.label.toLowerCase()}`;
            if (fiboMapping.fibo_definition) {
                map.set(fiboParent, fiboMapping.fibo_definition);
            }
        }
    });
    return map;
}

function lookupFiboDefinition(map, extRef) {
    // Legacy format: FIBO:Person or Schema.org:Action
    if (extRef.startsWith('FIBO:') || extRef.startsWith('Schema.org:')) {
        const prefix = extRef.startsWith('FIBO:') ? 'FIBO' : 'Schema.org';
        const shortName = extRef.substring(prefix.length + 1);
        // BUG-015 FIX: Normalize to lowercase for lookup
        const lookupKey = `${prefix}:${shortName.toLowerCase()}`;
        return map.get(lookupKey) || '';
    }
    return '';
}

describe('BUG-015: FIBO definition lookup case mismatch', () => {
    const testConcepts = [
        {
            name: 'Person',
            fibo_mapping: {
                label: 'person',  // lowercase in data
                fibo_definition: 'individual human being, with consciousness of self'
            }
        },
        {
            name: 'Active',
            fibo_mapping: {
                label: 'active',  // lowercase in data
                fibo_definition: 'Security is actively traded'
            }
        }
    ];

    it('builds map with lowercase keys (BUG-015)', () => {
        const map = buildFiboDefinitionMap(testConcepts);
        assert.strictEqual(map.has('FIBO:person'), true, 'Map should have lowercase key');
        assert.strictEqual(map.has('FIBO:Person'), false, 'Map should NOT have titlecase key');
    });

    it('looks up definition case-insensitively (BUG-015 fix)', () => {
        const map = buildFiboDefinitionMap(testConcepts);
        // Lookup with titlecase (as used in subsumption target)
        const definition = lookupFiboDefinition(map, 'FIBO:Person');
        assert.strictEqual(
            definition,
            'individual human being, with consciousness of self',
            'Should find definition regardless of case in lookup key'
        );
    });

    it('handles already lowercase lookup (BUG-015)', () => {
        const map = buildFiboDefinitionMap(testConcepts);
        const definition = lookupFiboDefinition(map, 'FIBO:person');
        assert.strictEqual(definition, 'individual human being, with consciousness of self');
    });

    it('handles mixed case lookup (BUG-015)', () => {
        const map = buildFiboDefinitionMap(testConcepts);
        const definition = lookupFiboDefinition(map, 'FIBO:PERSON');
        assert.strictEqual(definition, 'individual human being, with consciousness of self');
    });

    it('returns empty string for unknown FIBO concept (BUG-015)', () => {
        const map = buildFiboDefinitionMap(testConcepts);
        const definition = lookupFiboDefinition(map, 'FIBO:Unknown');
        assert.strictEqual(definition, '');
    });
});

// ============================================
// BUG-014: Sidebar duplicate domain names
// ============================================

/**
 * Simulate finding domain element by path (BUG-014 fix logic).
 * The fix uses data-path instead of data-name for unique identification.
 *
 * @param {Array} domElements - Array of {name, path, type} representing DOM elements
 * @param {string} targetPath - The path to search for
 * @returns {Object|null} The matching element or null
 */
function findDomainByPath(domElements, targetPath) {
    // BUG-014 FIX: Use path for unique identification
    return domElements.find(el =>
        el.path === targetPath && el.type === 'domain'
    ) || null;
}

/**
 * OLD buggy behavior: find by name only (returns first match)
 */
function findDomainByNameOnly(domElements, targetName) {
    return domElements.find(el =>
        el.name === targetName && el.type === 'domain'
    ) || null;
}

describe('BUG-014: Sidebar duplicate domain names', () => {
    // Simulate DOM structure with duplicate domain names
    const domElements = [
        // Top-level Investment
        { name: 'Investment', path: 'Investment', type: 'domain', depth: 0 },
        // Nested Investment under RBCZ/MIB
        { name: 'RBCZ', path: '', type: 'folder', depth: 0 },
        { name: 'MIB', path: '', type: 'folder', depth: 1 },
        { name: 'Investment', path: 'RBCZ/MIB/Investment', type: 'domain', depth: 2 },
        // Another domain for variety
        { name: 'Payment', path: 'Payment', type: 'domain', depth: 0 }
    ];

    it('finds correct domain by path when names are duplicated (BUG-014 fix)', () => {
        // Looking for nested Investment
        const result = findDomainByPath(domElements, 'RBCZ/MIB/Investment');
        assert.notStrictEqual(result, null, 'Should find the domain');
        assert.strictEqual(result.path, 'RBCZ/MIB/Investment');
        assert.strictEqual(result.name, 'Investment');
        assert.strictEqual(result.depth, 2, 'Should find nested domain, not top-level');
    });

    it('finds top-level domain by path', () => {
        const result = findDomainByPath(domElements, 'Investment');
        assert.notStrictEqual(result, null);
        assert.strictEqual(result.path, 'Investment');
        assert.strictEqual(result.depth, 0, 'Should find top-level domain');
    });

    it('returns null for non-existent path', () => {
        const result = findDomainByPath(domElements, 'NonExistent/Path');
        assert.strictEqual(result, null);
    });

    it('OLD BUG: findByName returns WRONG element for duplicates', () => {
        // This demonstrates the bug - finding by name alone returns first match
        const result = findDomainByNameOnly(domElements, 'Investment');
        assert.notStrictEqual(result, null);
        // BUG: Returns top-level Investment (depth 0) even when we wanted nested one
        assert.strictEqual(result.depth, 0, 'Bug: returns first match by name');
        assert.strictEqual(result.path, 'Investment', 'Bug: wrong path returned');
    });

    it('path-based lookup distinguishes same-named domains', () => {
        const topLevel = findDomainByPath(domElements, 'Investment');
        const nested = findDomainByPath(domElements, 'RBCZ/MIB/Investment');

        // Both have same name
        assert.strictEqual(topLevel.name, 'Investment');
        assert.strictEqual(nested.name, 'Investment');

        // But different paths (unique identifiers)
        assert.notStrictEqual(topLevel.path, nested.path);
        assert.strictEqual(topLevel.path, 'Investment');
        assert.strictEqual(nested.path, 'RBCZ/MIB/Investment');
    });

    it('does not match folders, only domains', () => {
        // RBCZ is a folder, not a domain
        const result = findDomainByPath(domElements, 'RBCZ');
        // Should not match because RBCZ has empty path and is a folder
        assert.strictEqual(result, null);
    });
});

// ============================================
// BUG-016: View cross-domain navigation
// When clicking a view from a different domain, must load domain first
// ============================================

/**
 * Simulates the view click handler logic from sidebar.js.
 * BUG-016 FIX: Check if view's domain matches current domain,
 * load domain first if needed.
 *
 * @param {Object} state - Current app state
 * @param {Object} viewItem - View item being clicked
 * @returns {Object} Action to take: { action: 'selectView' | 'loadThenSelect', domainPath?, viewId }
 */
function determineViewClickAction(state, viewItem) {
    const viewId = viewItem.name;
    const viewDomainPath = viewItem.domainPath;

    // BUG-016 FIX: Check if correct domain is loaded
    if (viewDomainPath && state.currentDomainPath !== viewDomainPath) {
        // Must load domain first, then select view
        return {
            action: 'loadThenSelect',
            domainPath: viewDomainPath,
            viewId: viewId
        };
    }

    // Domain already loaded, just select view
    return {
        action: 'selectView',
        viewId: viewId
    };
}

describe('BUG-016: View cross-domain navigation', () => {
    it('returns selectView when domain already loaded', () => {
        const state = { currentDomainPath: 'Example' };
        const viewItem = { name: 'Diagram 1.1', domainPath: 'Example' };

        const result = determineViewClickAction(state, viewItem);

        assert.strictEqual(result.action, 'selectView');
        assert.strictEqual(result.viewId, 'Diagram 1.1');
        assert.strictEqual(result.domainPath, undefined);
    });

    it('returns loadThenSelect when domain different (BUG-016 fix)', () => {
        // Current domain is Allin, clicking view from Example
        const state = { currentDomainPath: 'RBCZ/MIB/Allin' };
        const viewItem = { name: 'Diagram 1.1', domainPath: 'Example' };

        const result = determineViewClickAction(state, viewItem);

        assert.strictEqual(result.action, 'loadThenSelect', 'Must load domain first');
        assert.strictEqual(result.domainPath, 'Example', 'Should load Example domain');
        assert.strictEqual(result.viewId, 'Diagram 1.1');
    });

    it('handles nested domain paths', () => {
        // Current domain is Example, clicking view from nested Investment
        const state = { currentDomainPath: 'Example' };
        const viewItem = { name: 'Financial Account', domainPath: 'RBCZ/MIB/Investment' };

        const result = determineViewClickAction(state, viewItem);

        assert.strictEqual(result.action, 'loadThenSelect');
        assert.strictEqual(result.domainPath, 'RBCZ/MIB/Investment');
    });

    it('handles null current domain path', () => {
        const state = { currentDomainPath: null };
        const viewItem = { name: 'Order', domainPath: 'Test' };

        const result = determineViewClickAction(state, viewItem);

        assert.strictEqual(result.action, 'loadThenSelect');
        assert.strictEqual(result.domainPath, 'Test');
    });

    it('handles view without domain path (legacy)', () => {
        const state = { currentDomainPath: 'Example' };
        const viewItem = { name: 'SomeView', domainPath: null };

        const result = determineViewClickAction(state, viewItem);

        // No domain path on view = just select (can't determine if different)
        assert.strictEqual(result.action, 'selectView');
    });

    // Core BUG-016 scenario from bug report
    it('reproduces BUG-016: Diagram 1.1 after Allin', () => {
        // Step 1: Load Diagram 1.1 in Example (initial state)
        let state = { currentDomainPath: 'Example' };
        let viewItem = { name: 'Diagram 1.1', domainPath: 'Example' };

        let result = determineViewClickAction(state, viewItem);
        assert.strictEqual(result.action, 'selectView', 'Step 1: Select view in current domain');

        // Step 2: Navigate to Allin
        state = { currentDomainPath: 'RBCZ/MIB/Allin' };

        // Step 3: Click Diagram 1.1 again (from Example)
        viewItem = { name: 'Diagram 1.1', domainPath: 'Example' };
        result = determineViewClickAction(state, viewItem);

        // BUG-016 FIX: Must load Example first, then select view
        assert.strictEqual(
            result.action,
            'loadThenSelect',
            'Step 3: Must load Example before selecting Diagram 1.1'
        );
        assert.strictEqual(result.domainPath, 'Example');
        assert.strictEqual(result.viewId, 'Diagram 1.1');
    });

    it('same domain different views does not reload', () => {
        const state = { currentDomainPath: 'RBCZ/MIB/Investment' };

        // Click different views in same domain
        const view1 = { name: 'Financial Account', domainPath: 'RBCZ/MIB/Investment' };
        const view2 = { name: 'Order', domainPath: 'RBCZ/MIB/Investment' };

        const result1 = determineViewClickAction(state, view1);
        const result2 = determineViewClickAction(state, view2);

        assert.strictEqual(result1.action, 'selectView', 'No reload needed for same domain');
        assert.strictEqual(result2.action, 'selectView', 'No reload needed for same domain');
    });
});

/**
 * Simulates the data-domain-path attribute storage on view items.
 * BUG-016 FIX: Views must store their parent domain's filesystem path.
 */
describe('BUG-016: View item domain path storage', () => {
    /**
     * Simulates renderHierarchy view rendering with domain path
     */
    function createHierarchyViewItem(viewName, domainData) {
        return {
            name: viewName,
            type: 'view',
            domain: domainData.name,
            // BUG-016 FIX: Store filesystem path
            domainPath: domainData.path || ''
        };
    }

    /**
     * Simulates renderDomainViews view rendering with domain path
     */
    function createDynamicViewItem(viewId, viewName, domainPath, domainName) {
        return {
            name: viewId,
            type: 'view',
            domain: domainName,
            // BUG-016 FIX: Store filesystem path
            domainPath: domainPath
        };
    }

    it('hierarchy-rendered view stores domain filesystem path', () => {
        const domainData = {
            name: 'Example',
            path: 'Example',  // filesystem path
            type: 'domain'
        };

        const viewItem = createHierarchyViewItem('Diagram 1.1', domainData);

        assert.strictEqual(viewItem.domainPath, 'Example');
        assert.strictEqual(viewItem.domain, 'Example');
    });

    it('hierarchy-rendered view stores nested domain path', () => {
        const domainData = {
            name: 'Investment',
            path: 'RBCZ/MIB/Investment',  // nested filesystem path
            type: 'domain'
        };

        const viewItem = createHierarchyViewItem('Financial Account', domainData);

        assert.strictEqual(viewItem.domainPath, 'RBCZ/MIB/Investment');
        assert.strictEqual(viewItem.domain, 'Investment');
    });

    it('dynamically-rendered view stores domain path', () => {
        const viewItem = createDynamicViewItem(
            'Order',
            'Order',
            'Test/Order',  // domainPath parameter
            'Order'        // domainName
        );

        assert.strictEqual(viewItem.domainPath, 'Test/Order');
    });

    it('view items have all required attributes for navigation', () => {
        const viewItem = createDynamicViewItem(
            'Financial Account',
            'Financial Account',
            'RBCZ/MIB/Investment',
            'Investment'
        );

        // All attributes needed for BUG-016 fix
        assert.ok(viewItem.name, 'Must have name (view ID)');
        assert.ok(viewItem.type === 'view', 'Must have type=view');
        assert.ok(viewItem.domain, 'Must have domain name (for UI)');
        assert.ok(viewItem.domainPath, 'Must have domainPath (for navigation)');
    });
});

// ============================================
// BUG-017: Orphan categorization junction
// Ghost nodes require proper qname mapping
// ============================================

/**
 * Simulates ghost node detection logic from graph.js buildElements().
 * Ghost nodes are parent concepts that aren't in active view but have children in view.
 * BUG-017 FIX: Requires proper qname fields in data.js for nameToQname mapping.
 *
 * @param {Object} options - Configuration
 * @returns {Object} Helper functions for ghost detection
 */
function createGhostNodeHelper(options = {}) {
    const {
        nameToQname = new Map(),
        activeViewQnames = new Set(),
        childToParent = new Map(),
        internalNames = new Set()
    } = options;

    return {
        /**
         * Check if a concept is in active view (by qname lookup)
         * BUG-017: This fails if nameToQname is empty due to missing qname fields
         */
        isInActiveView(conceptName) {
            const qname = nameToQname.get(conceptName);
            // BUG-017: If qname is undefined, this returns false
            return qname ? activeViewQnames.has(qname) : false;
        },

        /**
         * Detect ghost nodes: parents not in view but with children in view
         */
        detectGhostNodes() {
            const ghostNames = new Set();

            // For each parent, check if any child is in active view
            for (const [parent, children] of childToParent) {
                const hasActiveChild = children.some(ch => this.isInActiveView(ch));
                const parentNotInView = !this.isInActiveView(parent);
                const parentIsInternal = internalNames.has(parent);

                if (hasActiveChild && parentIsInternal && parentNotInView) {
                    ghostNames.add(parent);
                }
            }

            return ghostNames;
        }
    };
}

describe('BUG-017: Ghost node detection with qnames', () => {
    it('detects ghost node when parent not in view but children are (working case)', () => {
        // Proper setup with qnames populated
        const nameToQname = new Map([
            ['Deposit', 'bkb-test:Deposit'],
            ['Incoming Payment', 'bkb-test:Incoming Payment']
        ]);
        const activeViewQnames = new Set(['bkb-test:Deposit']);  // Only Deposit in view
        const childToParent = new Map([
            ['Incoming Payment', ['Deposit']]  // Deposit is child of Incoming Payment
        ]);
        const internalNames = new Set(['Deposit', 'Incoming Payment']);

        const helper = createGhostNodeHelper({
            nameToQname,
            activeViewQnames,
            childToParent,
            internalNames
        });

        const ghostNodes = helper.detectGhostNodes();

        assert.ok(ghostNodes.has('Incoming Payment'), 'Incoming Payment should be ghost');
    });

    it('BUG-017: fails to detect ghost when qnames are missing', () => {
        // BUG-017 scenario: Empty nameToQname (stale data.js without qnames)
        const nameToQname = new Map();  // EMPTY - simulates stale data
        const activeViewQnames = new Set(['bkb-test:Deposit']);
        const childToParent = new Map([
            ['Incoming Payment', ['Deposit']]
        ]);
        const internalNames = new Set(['Deposit', 'Incoming Payment']);

        const helper = createGhostNodeHelper({
            nameToQname,
            activeViewQnames,
            childToParent,
            internalNames
        });

        // isInActiveView returns false for all because no qname mapping
        assert.strictEqual(
            helper.isInActiveView('Deposit'),
            false,
            'BUG: Deposit lookup fails without qname'
        );

        const ghostNodes = helper.detectGhostNodes();

        // Ghost detection fails because isInActiveView('Deposit') returns false
        assert.strictEqual(
            ghostNodes.has('Incoming Payment'),
            false,
            'BUG: Ghost detection fails without qnames'
        );
    });

    it('ghost detection requires complete qname mapping', () => {
        // Partial mapping - only some concepts have qnames
        const nameToQname = new Map([
            ['Deposit', 'bkb-test:Deposit']
            // 'Incoming Payment' is missing!
        ]);
        const activeViewQnames = new Set(['bkb-test:Deposit']);
        const childToParent = new Map([
            ['Incoming Payment', ['Deposit']]
        ]);
        const internalNames = new Set(['Deposit', 'Incoming Payment']);

        const helper = createGhostNodeHelper({
            nameToQname,
            activeViewQnames,
            childToParent,
            internalNames
        });

        const ghostNodes = helper.detectGhostNodes();

        // Works correctly because Deposit has qname mapping
        assert.ok(
            ghostNodes.has('Incoming Payment'),
            'Ghost detected when child has qname'
        );
    });

    it('no ghost nodes when parent is also in view', () => {
        const nameToQname = new Map([
            ['Deposit', 'bkb-test:Deposit'],
            ['Incoming Payment', 'bkb-test:Incoming Payment']
        ]);
        // Both in view
        const activeViewQnames = new Set([
            'bkb-test:Deposit',
            'bkb-test:Incoming Payment'
        ]);
        const childToParent = new Map([
            ['Incoming Payment', ['Deposit']]
        ]);
        const internalNames = new Set(['Deposit', 'Incoming Payment']);

        const helper = createGhostNodeHelper({
            nameToQname,
            activeViewQnames,
            childToParent,
            internalNames
        });

        const ghostNodes = helper.detectGhostNodes();

        assert.strictEqual(
            ghostNodes.has('Incoming Payment'),
            false,
            'Parent in view should not become ghost'
        );
    });

    it('no ghost nodes when no active view filter', () => {
        const nameToQname = new Map([
            ['Deposit', 'bkb-test:Deposit'],
            ['Incoming Payment', 'bkb-test:Incoming Payment']
        ]);
        // All concepts are in "active view" when no filter
        const activeViewQnames = new Set([
            'bkb-test:Deposit',
            'bkb-test:Incoming Payment'
        ]);
        const childToParent = new Map([
            ['Incoming Payment', ['Deposit']]
        ]);
        const internalNames = new Set(['Deposit', 'Incoming Payment']);

        const helper = createGhostNodeHelper({
            nameToQname,
            activeViewQnames,
            childToParent,
            internalNames
        });

        const ghostNodes = helper.detectGhostNodes();

        assert.strictEqual(ghostNodes.size, 0, 'No ghosts when all visible');
    });
});

// ============================================
// BUG-018: Categorization children visibility
// Relationship expansion must include categorization children
// ============================================

/**
 * Simulates buildElements() visibility logic from graph.js.
 * BUG-018 FIX: When concept is added via relationship expansion,
 * must also recursively add its categorization children.
 *
 * @param {Object} options - Configuration
 * @returns {Object} Helper with visibility functions
 */
function createVisibilityHelper(options = {}) {
    const {
        childToParent = new Map(),  // parent -> [children]
        relationships = [],
        internalNames = new Set(),
        rootConcepts = []
    } = options;

    const visibleNames = new Set();

    /**
     * Recursively add concept and its children to visible set.
     * This is the addTree() function from graph.js.
     */
    function addTree(name) {
        if (!name || visibleNames.has(name)) return;
        if (!internalNames.has(name)) return;

        visibleNames.add(name);

        // Add all children recursively
        const children = childToParent.get(name) || [];
        children.forEach(child => addTree(child));
    }

    return {
        visibleNames,
        addTree,

        /**
         * Build visible set: start from roots, expand via relationships
         * BUG-018: OLD behavior just did visibleNames.add() in relationship expansion
         */
        buildVisibleSetOld() {
            visibleNames.clear();

            // Add root concepts and their children
            rootConcepts.forEach(root => addTree(root));

            // Relationship expansion (OLD BUGGY VERSION)
            relationships.forEach(rel => {
                const subj = rel.subject_name;
                const obj = rel.object_name;

                if (visibleNames.has(subj) && internalNames.has(obj)) {
                    // BUG: Only adds obj, not its children
                    visibleNames.add(obj);
                }
                if (visibleNames.has(obj) && internalNames.has(subj)) {
                    visibleNames.add(subj);
                }
            });

            return visibleNames;
        },

        /**
         * Build visible set: start from roots, expand via relationships
         * BUG-018 FIX: Uses addTree() in relationship expansion
         */
        buildVisibleSetFixed() {
            visibleNames.clear();

            // Add root concepts and their children
            rootConcepts.forEach(root => addTree(root));

            // Relationship expansion (FIXED VERSION)
            relationships.forEach(rel => {
                const subj = rel.subject_name;
                const obj = rel.object_name;

                if (visibleNames.has(subj) && internalNames.has(obj)) {
                    // FIX: Use addTree to include children
                    addTree(obj);
                }
                if (visibleNames.has(obj) && internalNames.has(subj)) {
                    addTree(subj);
                }
            });

            return visibleNames;
        }
    };
}

describe('BUG-018: Categorization children after relationship expansion', () => {
    // Test setup mimics the scenario from bug report:
    // Account -> (is composed of) -> Currency
    // Currency has children: EUR, CZK, USD

    it('BUG-018: OLD behavior excludes categorization children', () => {
        const helper = createVisibilityHelper({
            childToParent: new Map([
                ['Currency', ['EUR', 'CZK', 'USD']]  // Currency has 3 children
            ]),
            relationships: [
                { subject_name: 'Account', object_name: 'Currency', verb_phrase: 'is composed of' }
            ],
            internalNames: new Set(['Account', 'Currency', 'EUR', 'CZK', 'USD']),
            rootConcepts: ['Account']
        });

        const visible = helper.buildVisibleSetOld();

        // Account is visible (root)
        assert.ok(visible.has('Account'), 'Account should be visible (root)');
        // Currency added via relationship
        assert.ok(visible.has('Currency'), 'Currency should be visible (relationship)');
        // BUG: Children are NOT visible
        assert.strictEqual(
            visible.has('EUR'),
            false,
            'BUG: EUR should NOT be visible in old behavior'
        );
        assert.strictEqual(
            visible.has('CZK'),
            false,
            'BUG: CZK should NOT be visible in old behavior'
        );
        assert.strictEqual(
            visible.has('USD'),
            false,
            'BUG: USD should NOT be visible in old behavior'
        );
    });

    it('BUG-018 FIX: includes categorization children after relationship expansion', () => {
        const helper = createVisibilityHelper({
            childToParent: new Map([
                ['Currency', ['EUR', 'CZK', 'USD']]
            ]),
            relationships: [
                { subject_name: 'Account', object_name: 'Currency', verb_phrase: 'is composed of' }
            ],
            internalNames: new Set(['Account', 'Currency', 'EUR', 'CZK', 'USD']),
            rootConcepts: ['Account']
        });

        const visible = helper.buildVisibleSetFixed();

        // All should be visible
        assert.ok(visible.has('Account'), 'Account should be visible');
        assert.ok(visible.has('Currency'), 'Currency should be visible');
        assert.ok(visible.has('EUR'), 'EUR should be visible (FIX)');
        assert.ok(visible.has('CZK'), 'CZK should be visible (FIX)');
        assert.ok(visible.has('USD'), 'USD should be visible (FIX)');
    });

    it('handles nested categorization children', () => {
        // Currency -> EUR -> EuroZone (nested)
        const helper = createVisibilityHelper({
            childToParent: new Map([
                ['Currency', ['EUR']],
                ['EUR', ['EuroZone']]
            ]),
            relationships: [
                { subject_name: 'Account', object_name: 'Currency', verb_phrase: 'is composed of' }
            ],
            internalNames: new Set(['Account', 'Currency', 'EUR', 'EuroZone']),
            rootConcepts: ['Account']
        });

        const visible = helper.buildVisibleSetFixed();

        assert.ok(visible.has('Currency'), 'Currency visible');
        assert.ok(visible.has('EUR'), 'EUR visible');
        assert.ok(visible.has('EuroZone'), 'Nested EuroZone visible');
    });

    it('handles bidirectional relationship expansion', () => {
        // B -> A (relationship), A has children
        const helper = createVisibilityHelper({
            childToParent: new Map([
                ['A', ['A1', 'A2']]
            ]),
            relationships: [
                { subject_name: 'B', object_name: 'A', verb_phrase: 'references' }
            ],
            internalNames: new Set(['A', 'A1', 'A2', 'B']),
            rootConcepts: ['B']
        });

        const visible = helper.buildVisibleSetFixed();

        assert.ok(visible.has('A'), 'A visible via relationship');
        assert.ok(visible.has('A1'), 'A1 visible (child of A)');
        assert.ok(visible.has('A2'), 'A2 visible (child of A)');
    });

    it('handles multiple relationship expansions', () => {
        // Root -> A (rel1), A -> B (rel2), B has children
        const helper = createVisibilityHelper({
            childToParent: new Map([
                ['B', ['B1', 'B2']]
            ]),
            relationships: [
                { subject_name: 'Root', object_name: 'A', verb_phrase: 'has' },
                { subject_name: 'A', object_name: 'B', verb_phrase: 'uses' }
            ],
            internalNames: new Set(['Root', 'A', 'B', 'B1', 'B2']),
            rootConcepts: ['Root']
        });

        const visible = helper.buildVisibleSetFixed();

        assert.ok(visible.has('Root'), 'Root visible');
        assert.ok(visible.has('A'), 'A visible via relationship');
        assert.ok(visible.has('B'), 'B visible via chained relationship');
        assert.ok(visible.has('B1'), 'B1 visible (child of B)');
        assert.ok(visible.has('B2'), 'B2 visible (child of B)');
    });

    it('no duplicate processing of already-visible concepts', () => {
        // Concept already visible should not be re-processed
        const helper = createVisibilityHelper({
            childToParent: new Map([
                ['Root', ['Child1', 'Child2']]
            ]),
            relationships: [
                // Relationship points back to Root which is already visible
                { subject_name: 'Child1', object_name: 'Root', verb_phrase: 'belongs to' }
            ],
            internalNames: new Set(['Root', 'Child1', 'Child2']),
            rootConcepts: ['Root']
        });

        const visible = helper.buildVisibleSetFixed();

        // Should have exactly 3 items, no duplicates/loops
        assert.strictEqual(visible.size, 3);
        assert.ok(visible.has('Root'));
        assert.ok(visible.has('Child1'));
        assert.ok(visible.has('Child2'));
    });

    it('external concepts are not expanded', () => {
        // External concept (not in internalNames) should not have children expanded
        const helper = createVisibilityHelper({
            childToParent: new Map([
                ['FIBO:Currency', ['FIBO:MonetaryUnit']]  // External
            ]),
            relationships: [
                { subject_name: 'Account', object_name: 'FIBO:Currency', verb_phrase: 'uses' }
            ],
            internalNames: new Set(['Account']),  // FIBO concepts not internal
            rootConcepts: ['Account']
        });

        const visible = helper.buildVisibleSetFixed();

        assert.ok(visible.has('Account'), 'Account visible');
        assert.strictEqual(
            visible.has('FIBO:Currency'),
            false,
            'External concept not added to internal visible set'
        );
    });
});

// ============================================
// BUG-025: Ghost Orphan Counting Tests
// ============================================

/**
 * Mock Cytoscape node for testing filter logic
 */
function createMockNode(options = {}) {
    const classes = new Set(options.classes || []);
    const data = options.data || {};
    let isHidden = options.hidden || false;
    const connectedEdgesList = options.connectedEdges || [];

    return {
        hasClass: (cls) => classes.has(cls),
        data: (key) => key ? data[key] : data,
        hidden: () => isHidden,
        hide: () => { isHidden = true; },
        connectedEdges: () => ({
            filter: (fn) => connectedEdgesList.filter(fn),
            forEach: (fn) => connectedEdgesList.forEach(fn),
            length: connectedEdgesList.length
        })
    };
}

/**
 * Mock Cytoscape edge for testing filter logic
 */
function createMockEdge(options = {}) {
    const data = options.data || {};
    let isHidden = options.hidden || false;

    return {
        data: (key) => key ? data[key] : data,
        hidden: () => isHidden,
        hide: () => { isHidden = true; }
    };
}

/**
 * Simulates the ghost orphan counting logic from getFilterCounts()
 * BUG-025 Part 1: Ghost nodes should be counted as orphans if they have no visible edges
 */
function countGhostOrphans(nodes) {
    let count = 0;
    nodes.forEach(node => {
        if (node.hasClass('ghost')) {
            const visibleEdges = node.connectedEdges().filter(e => !e.hidden());
            if (!node.hidden() && visibleEdges.length === 0) {
                count++;
            }
        }
    });
    return count;
}

/**
 * Simulates the junction trunk hiding logic from applyFilter()
 * BUG-025 Part 2: Junction nodes should be hidden if their trunk edge is hidden
 */
function hideJunctionsWithoutTrunk(junctionNodes) {
    const hiddenJunctions = [];
    junctionNodes.forEach(node => {
        if (node.hidden()) return;
        const trunkEdges = node.connectedEdges().filter(edge =>
            edge.data('type') === 'trunk' && !edge.hidden()
        );
        if (trunkEdges.length === 0) {
            node.hide();
            hiddenJunctions.push(node);
            // Also hide all edges connected to this junction
            node.connectedEdges().forEach(edge => edge.hide());
        }
    });
    return hiddenJunctions;
}

describe('BUG-025: Ghost Orphan Counting', () => {
    it('counts visible ghost with no visible edges as orphan', () => {
        const ghost = createMockNode({
            classes: ['ghost'],
            hidden: false,
            connectedEdges: []  // No edges = orphan
        });

        const count = countGhostOrphans([ghost]);
        assert.strictEqual(count, 1, 'Ghost with no edges should be counted as orphan');
    });

    it('does not count hidden ghost as orphan', () => {
        const ghost = createMockNode({
            classes: ['ghost'],
            hidden: true,
            connectedEdges: []
        });

        const count = countGhostOrphans([ghost]);
        assert.strictEqual(count, 0, 'Hidden ghost should not be counted');
    });

    it('does not count ghost with visible edges as orphan', () => {
        const visibleEdge = createMockEdge({ hidden: false });
        const ghost = createMockNode({
            classes: ['ghost'],
            hidden: false,
            connectedEdges: [visibleEdge]
        });

        const count = countGhostOrphans([ghost]);
        assert.strictEqual(count, 0, 'Ghost with visible edges is not an orphan');
    });

    it('counts ghost with only hidden edges as orphan', () => {
        const hiddenEdge = createMockEdge({ hidden: true });
        const ghost = createMockNode({
            classes: ['ghost'],
            hidden: false,
            connectedEdges: [hiddenEdge]
        });

        const count = countGhostOrphans([ghost]);
        assert.strictEqual(count, 1, 'Ghost with only hidden edges should be counted as orphan');
    });

    it('does not count non-ghost nodes', () => {
        const regularNode = createMockNode({
            classes: ['domain'],
            hidden: false,
            connectedEdges: []
        });

        const count = countGhostOrphans([regularNode]);
        assert.strictEqual(count, 0, 'Non-ghost nodes should not be counted by ghost orphan logic');
    });

    it('counts multiple ghost orphans correctly', () => {
        const ghost1 = createMockNode({ classes: ['ghost'], hidden: false, connectedEdges: [] });
        const ghost2 = createMockNode({ classes: ['ghost'], hidden: false, connectedEdges: [] });
        const ghost3 = createMockNode({
            classes: ['ghost'],
            hidden: false,
            connectedEdges: [createMockEdge({ hidden: false })]  // Has visible edge
        });

        const count = countGhostOrphans([ghost1, ghost2, ghost3]);
        assert.strictEqual(count, 2, 'Should count only ghosts without visible edges');
    });
});

describe('BUG-025: Junction Trunk Visibility', () => {
    it('hides junction when trunk edge is hidden', () => {
        const hiddenTrunk = createMockEdge({ data: { type: 'trunk' }, hidden: true });
        const junction = createMockNode({
            classes: ['junction'],
            hidden: false,
            connectedEdges: [hiddenTrunk]
        });

        const hidden = hideJunctionsWithoutTrunk([junction]);
        assert.strictEqual(hidden.length, 1, 'Junction with hidden trunk should be hidden');
        assert.ok(junction.hidden(), 'Junction should be marked as hidden');
    });

    it('keeps junction when trunk edge is visible', () => {
        const visibleTrunk = createMockEdge({ data: { type: 'trunk' }, hidden: false });
        const junction = createMockNode({
            classes: ['junction'],
            hidden: false,
            connectedEdges: [visibleTrunk]
        });

        const hidden = hideJunctionsWithoutTrunk([junction]);
        assert.strictEqual(hidden.length, 0, 'Junction with visible trunk should not be hidden');
        assert.ok(!junction.hidden(), 'Junction should remain visible');
    });

    it('hides junction with no trunk edges', () => {
        const branchEdge = createMockEdge({ data: { type: 'branch' }, hidden: false });
        const junction = createMockNode({
            classes: ['junction'],
            hidden: false,
            connectedEdges: [branchEdge]  // Only branch, no trunk
        });

        const hidden = hideJunctionsWithoutTrunk([junction]);
        assert.strictEqual(hidden.length, 1, 'Junction with no trunk should be hidden');
    });

    it('skips already hidden junctions', () => {
        const junction = createMockNode({
            classes: ['junction'],
            hidden: true,  // Already hidden
            connectedEdges: []
        });

        const hidden = hideJunctionsWithoutTrunk([junction]);
        assert.strictEqual(hidden.length, 0, 'Already hidden junction should be skipped');
    });

    it('hides connected edges when hiding junction', () => {
        const trunk = createMockEdge({ data: { type: 'trunk' }, hidden: true });
        const branch1 = createMockEdge({ data: { type: 'branch' }, hidden: false });
        const branch2 = createMockEdge({ data: { type: 'branch' }, hidden: false });
        const junction = createMockNode({
            classes: ['junction'],
            hidden: false,
            connectedEdges: [trunk, branch1, branch2]
        });

        hideJunctionsWithoutTrunk([junction]);

        assert.ok(branch1.hidden(), 'Branch edge 1 should be hidden');
        assert.ok(branch2.hidden(), 'Branch edge 2 should be hidden');
    });
});

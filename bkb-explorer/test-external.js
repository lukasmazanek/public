/**
 * Test external concepts and isA relationships (E8-E10)
 */
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('file:///Users/luke/claude/bkb-explorer/index.html');
    await page.waitForTimeout(1500);

    // Navigate to Order domain (has external Service Channel)
    await page.click('text=Order');
    await page.waitForTimeout(1000);

    // Check for external nodes
    const externalNodes = await page.evaluate(() => {
        if (!Graph.cy) return [];
        return Graph.cy.nodes('.external').map(n => ({
            id: n.id(),
            name: n.data('name'),
            source: n.data('source'),
            isExternal: n.data('isExternal')
        }));
    });

    console.log('External nodes in Order view:', externalNodes.length);
    externalNodes.forEach(n => console.log('  -', n.id, '|', n.name, '|', n.source));

    // Check for isA edges
    const isAEdges = await page.evaluate(() => {
        if (!Graph.cy) return [];
        return Graph.cy.edges('.isA').map(e => ({
            id: e.id(),
            source: e.data('source'),
            target: e.data('target'),
            label: e.data('sourceLabel')
        }));
    });

    console.log('\nisA edges in Order view:', isAEdges.length);
    isAEdges.forEach(e => console.log('  -', e.source, '-[', e.label, ']->', e.target));

    // Navigate to Transaction (has Action external)
    await page.click('text=Transaction');
    await page.waitForTimeout(1000);

    const transExternals = await page.evaluate(() => {
        if (!Graph.cy) return [];
        return Graph.cy.nodes('.external').map(n => ({
            id: n.id(),
            name: n.data('name'),
            source: n.data('source')
        }));
    });

    console.log('\nExternal nodes in Transaction view:', transExternals.length);
    transExternals.forEach(n => console.log('  -', n.id, '|', n.name, '|', n.source));

    const transIsA = await page.evaluate(() => {
        if (!Graph.cy) return [];
        return Graph.cy.edges('.isA').map(e => ({
            source: e.data('source'),
            target: e.data('target')
        }));
    });

    console.log('\nisA edges in Transaction view:', transIsA.length);
    transIsA.forEach(e => console.log('  -', e.source, '->', e.target));

    await browser.close();

    // Summary
    console.log('\n=== E8-E10 SUMMARY ===');
    const hasExternals = externalNodes.length > 0 || transExternals.length > 0;
    const hasIsA = isAEdges.length > 0 || transIsA.length > 0;
    console.log('E8 (Parse external_concepts):', hasExternals ? '✓ WORKING' : '✗ NEEDS FIX');
    console.log('E9 (Render isA edges):', hasIsA ? '✓ WORKING' : '✗ NEEDS FIX');
    console.log('E10 (External node style):', hasExternals ? '✓ WORKING' : '✗ NEEDS FIX');

    process.exit(hasExternals && hasIsA ? 0 : 1);
})();

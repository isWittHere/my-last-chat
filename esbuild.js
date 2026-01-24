const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

// 复制 codicons 资源到 out/codicons 目录
function copyCodeicons() {
    const srcDir = path.join(__dirname, 'node_modules', '@vscode', 'codicons', 'dist');
    const destDir = path.join(__dirname, 'out', 'codicons');
    
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    
    // 只复制必要的文件
    const filesToCopy = ['codicon.css', 'codicon.ttf'];
    for (const file of filesToCopy) {
        const srcFile = path.join(srcDir, file);
        const destFile = path.join(destDir, file);
        if (fs.existsSync(srcFile)) {
            fs.copyFileSync(srcFile, destFile);
            console.log(`Copied: ${file}`);
        }
    }
}

async function main() {
    // 先复制 codicons 资源
    copyCodeicons();
    
    const ctx = await esbuild.context({
        entryPoints: ['src/extension.ts'],
        bundle: true,
        format: 'cjs',
        minify: production,
        sourcemap: !production,
        sourcesContent: false,
        platform: 'node',
        outfile: 'out/extension.js',
        external: ['vscode'],
        logLevel: 'info',
        plugins: [
            /* add plugins here */
        ],
    });
    if (watch) {
        await ctx.watch();
    } else {
        await ctx.rebuild();
        await ctx.dispose();
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});

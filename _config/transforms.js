import { minify } from "html-minifier-terser";
import * as cheerio from 'cheerio';

export default function(eleventyConfig) {
  // `text` code blocks won't have their HTML escaped, which can result in
  // weird edge cases:
  //   https://github.com/11ty/eleventy-plugin-syntaxhighlight/issues/54
  eleventyConfig.addTransform("forbidTextInCode", function(content) {
    if (this.outputPath && this.outputPath.endsWith(".html")) {
      if (content.includes('<pre class="language-text"')) {
        throw new Error(
          `Use "plain" instead of "text" in code blocks in ${this.outputPath}`
        );
      }
    }

    return content;
  });

  eleventyConfig.addTransform("htmlmin", async (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith(".html")) {
      return content;
    }

    const minified = await minify(content, {
      removeComments: true,
      // Markdown rendering results in HTML such as:
      //   <a href="...">hey</a> there
      // This should read "hey there" but it's incorrectly minified, resulting
      // in "heythere". The easiest fix is to prevent it altogether.
      collapseWhitespace: false,
      removeRedundantAttributes: true,
      minifyCSS: true,
      minifyJS: true,
      ignoreCustomFragments: [
        // The minifier breaks with Rust lifetimes such as <'a>.
        //
        // See https://github.com/terser/html-minifier-terser/issues/161
        /<code[\s\S]*?>[\s\S]*?<\/code>/g,
      ],
    });
    return minified;
  });
};


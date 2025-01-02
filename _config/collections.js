import fs from "fs";

export default function(eleventyConfig) {
  // Every other collection is considered a tag. We aggregate them over all
  // posts, and keep count of its occurrences and the date of its last modified
  // post. They're sorted in descending order based on the occurrence count.
  eleventyConfig.addCollection("tags", function (collectionsApi) {
    let tags = new Map();
    collectionsApi.getAll().forEach(function(item) {
      if (!item.data.tags) {
        return;
      }
      if (item.data.draft && process.env.ELEVENTY_RUN_MODE !== "build") {
        return;
      }

      const itemLastModified = fs.statSync(item.inputPath).mtime;

      for (const tagName of item.data.tags) {
        if (tagName === "all" || tagName === "series" || tagName === "posts") {
          continue;
        }

        const tag = tags.get(tagName);
        if (!tag) {
          tags.set(tagName, {
            count: 1,
            lastModified: itemLastModified
          });
        } else {
          tag.count += 1;
          if (itemLastModified > tag.lastModified) {
            tag.lastModified = itemLastModified;
          }
        }
      }
    });

    // Transform the Map to an array of objects, and slugify the names
    const slugify = eleventyConfig.getFilter("slugify");
    tags = Array.from(tags, ([name, { count, lastModified }]) => ({
      name: slugify(name),
      count,
      lastModified
    }));
    return tags.sort((t1, t2) => t2.count - t1.count);  // Descending
  });
}

import { z } from "zod";
import { fromZodError } from 'zod-validation-error';

export default {
  eleventyDataSchema: function(data) {
    // The RSS plugin copies a file into the `content` directory that we don't
    // control.
    if (data.page.fileSlug === "eleventy-plugin-feed-nullderef-atom") {
      return
    }

    let result = z.object({
      title: z.string(),
      description: z.string(),
      image: z.string().optional(),
    }).safeParse(data);

    if (result.error) {
      throw fromZodError(result.error);
    }
  },
};

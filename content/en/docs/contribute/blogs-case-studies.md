---
title: Submit a blog post
linkTitle: Submit a blog post
slug: blogs-case-studies
weight: 30
cSpell:ignore: open-telemetry
---

The [OpenTelemetry blog](/blog/) communicates new features, community reports,
and any news that might be relevant to the OpenTelemetry community. This
includes end users and developers. Anyone can write a blog post and submit it
for review.

## Before submitting a blog post

Blog posts should not be commercial in nature and should consist of original
content that applies broadly to the OpenTelemetry community.

Verify that your intended content broadly applies to the OpenTelemetry Community
. Appropriate content includes:

- New OpenTelemetry capabilities
- OpenTelemetry projects updates
- Updates from Special Interest Groups
- Tutorials and walkthroughs
- OpenTelemetry Integrations

Unsuitable content includes:

- Vendor product pitches

To submit a blog post,
[raise an issue](https://github.com/open-telemetry/opentelemetry.io/issues/new?title=New%20Blog%20Post:%20%3Ctitle%3E)
with the title and a short description of your blog post. If you are not a
[Member](https://github.com/open-telemetry/community/blob/main/community-membership.md#member),
you also need to provide a _sponsor_ for your blog post, who is a Member (by
that definition) and who is willing to provide a first review of your blog post.

If you do not raise an issue before providing your PR, we may request you to do
so before providing a review.

## Submit a blog post

You can submit a blog post either by forking this repository and writing it
locally or by using the GitHub UI. In both cases we ask you to follow the
instructions provided by the
[blog post template](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/blog.md).

**Note**: Before writing a blog post, ask yourself if your content also might be
a good addition to the documentation. If the answer is "yes", create a new issue
or pull request (PR) with your content to get it added to the docs.

### Fork and write locally

After you've set up the local fork you can create a blog post using a template.
Follow these steps to create a post from the template:

1. Run the following command from the repository root:

   ```sh
   npx hugo new content/en/blog/2023/short-name-for-post.md
   ```

   If your post has images or other assets, run the following command:

   ```sh
   npx hugo new content/en/blog/2023/short-name-for-post/index.md
   ```

1. Edit the Markdown file at the path you provided in the previous command. The
   file is initialized from the blog-post starter under
   [archetypes](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/).

1. Put assets, like images or other files, into the folder you've created.

1. When your post is ready, submit it through a pull request.

### Use the GitHub UI

If you prefer not to create a local fork, you can use the GitHub UI to create a
new post. Follow these steps to add a post using the UI:

1.  Go to the
    [blog post template](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/blog.md)
    and click on **Copy raw content** at the top right of the menu.

1.  Select
    [Create a new file](https://github.com/open-telemetry/opentelemetry.io/new/main).

1.  Paste the content from the template you copied in the first step.

1.  Name your file, for example
    `content/en/blog/2022/short-name-for-your-blog-post/index.md`.

1.  Edit the Markdown file in GitHub.

1.  When your post is ready, select **Propose changes** and follow the
    instructions.

## Publication timelines

The OpenTelemetry blog doesn't follow a strict publication timeline, this means:

- Your blog post will be published when it has all the approvals required.
- Publication can be postponed if needed, but maintainers can't guarantee
  publication at or before a certain date.
- Certain blog posts (major announcements) take precedence and may be published
  before your blog post.

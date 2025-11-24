---
title: Blog
description: Learn how to submit a blog post.
weight: 30
---

The [OpenTelemetry blog](/blog/) communicates new features, community reports,
and any news that might be relevant to the OpenTelemetry community. This
includes end users and developers. Anyone can write a blog post, read below what
the requirements are.

## Documentation or blog post?

Before writing a blog post, ask yourself if your content also might be a good
addition to the documentation. If the answer is "yes", create a new issue or
pull request (PR) with your content to get it added to the docs.

Note, that the focus of maintainers and approvers of the OpenTelemetry Website
is to improve the documentation of the project, so your blog post will have a
lower priority for review.

## Social Media Content Request

If you want to request the publication of content on the social media channels
of the OpenTelemetry project, which aren't a blog post,
[use this form](https://github.com/open-telemetry/community/issues/new?template=social-media-request.yml).

## Before submitting a blog post

Blog posts should not be commercial in nature and should consist of original
content that applies broadly to the OpenTelemetry community. Blog posts should
follow the policies outlined in the
[Social Media Guide](https://github.com/open-telemetry/community/blob/main/social-media-guide.md).

Verify that your intended content broadly applies to the OpenTelemetry Community
. Appropriate content includes:

- New OpenTelemetry capabilities
- OpenTelemetry projects updates
- Updates from Special Interest Groups
- Tutorials and walkthroughs
- OpenTelemetry Integrations
- [Call for Contributors](#call-for-contributors)

Unsuitable content includes:

- Vendor product pitches

If your blog post fits into the list of appropriate content,
[raise an issue](https://github.com/open-telemetry/opentelemetry.io/issues/new?title=New%20Blog%20Post:%20%3Ctitle%3E)
with the following details:

- Title of the blog post
- Short description and outline of your blog post
- If applicable, list the technologies used in your blog post. Make sure that
  all of them are open source, and prefer CNCF projects over non-CNCF projects
  (e.g. use Jaeger for trace visualization, and Prometheus for metric
  visualization)
- Name of a [SIG](https://github.com/open-telemetry/community/), which is
  related to this blog post
- Name of a sponsor (maintainer or approver) from this SIG, who will help to
  review that PR. That sponsor should ideally be from a different company.

Maintainers of SIG Communication will verify, that your blog post satisfies all
the requirements for being accepted. If you cannot name a SIG/sponsor in your
initial issue details, they will also point you to an appropriate SIG, you can
reach out to for sponsorship. Having a sponsor is optional, but having one
increases the chance of having your blog post reviewed and approved more
quickly.

If your issue has everything needed, a maintainer will verify that you can go
ahead and submit your blog post.

### Call for Contributors

If you are proposing the creation of a new project or SIG, or if you are
offering a donation to the OpenTelemetry project, you will need additional
contributors to be successful with your proposal. To help you with that, you can
propose a blog post that is a "Call for Contributors" (CfC).

This requires, that you follow the processes for
[new projects](https://github.com/open-telemetry/community/blob/main/project-management.md)
and
[donations](https://github.com/open-telemetry/community/blob/main/guides/contributor/donations.md).

## Submit a blog post

You can submit a blog post either by forking this repository and writing it
locally or by using the GitHub UI. In both cases we ask you to follow the
instructions provided by the
[blog post template](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/blog.md).

### Fork and write locally

After you've set up the local fork you can create a blog post using a template.
Follow these steps to create a post from the template:

1. Run the following command from the repository root:

   ```sh
   npx hugo new content/en/blog/2024/short-name-for-post.md
   ```

   If your post has images or other assets, run the following command:

   ```sh
   npx hugo new content/en/blog/2024/short-name-for-post/index.md
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

## Cross-posting blog content

If you'd like to share your OpenTelemetry blog post on another platform, you're
welcome to do so. Just keep the following in mind:

- Decide which version will be the canonical post (typically the original
  OpenTelemetry blog post).
- Other versions of the post should:
  - Clearly mention that the original post appeared on the OpenTelemetry blog.
  - Include a link back to the original at the top or bottom of the page.
  - Set a canonical URL tag pointing to the OpenTelemetry blog post, if the
    platform supports it.

This helps ensure proper attribution, supports SEO best practices, and avoids
content duplication.

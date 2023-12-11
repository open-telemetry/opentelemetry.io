# Contribution Guidelines for blog posts

## Before submitting a blog post

As a first step, please verify that your intended content broadly applies to the
OpenTelemetry Community. Appropriate content includes:

- New OpenTelemetry capabilities
- OpenTelemetry project updates
- Updates from Special Interest Groups
- Tutorials and walkthroughs
- OpenTelemetry Integrations

Unsuitable content includes:

- Vendor product pitches

We ask you to
[raise an issue](https://github.com/open-telemetry/opentelemetry.io/issues/new?title=New%20Blog%20Post:%20%3Ctitle%3E)
with the title and a short description of your blog post. If you are not a
[Member](https://github.com/open-telemetry/community/blob/main/community-membership.md#member),
you also need to provide a _sponsor_ for your blog post, who is a Member (by
that definition) and who is willing to provide a first review of your blog post.

If you do not raise an issue before providing your PR, we may request you to do
so before providing a review.

## Submitting a blog post

You can submit a blog post either by forking this repository and writing it
locally or by using the GitHub UI. In both cases we ask you to follow the
instructions provided by the [blog post template](archetypes/blog.md).

**Note**: Before writing a blog post, please ask yourself, if your content also
might be a good addition to the documentation. If the answer is yes, create a
new issue/PR with your content to get it added to the docs.

### Fork & Write locally

Follow the [setup instructions][contributing.md] then, to create a skeletal blog
post, run the following command from the repository root:

```sh
npx hugo new content/en/blog/2023/short-name-for-post.md
```

If your post will have images or other assets, instead run:

```sh
npx hugo new content/en/blog/2023/short-name-for-post/index.md
```

Edit the markdown file at the path you provided in the previous command. The
file is initialized from the blog-post starter under [archetypes](archetypes).

Put assets, if any, like images into the folder created.

Once your post is ready, submit it through a [pull request][].

### Using the GitHub UI

- Go to the [blog post template](archetypes/blog.md) and click on
  `Copy raw content` at the top right of the menu.
- [Create a new file](https://github.com/open-telemetry/opentelemetry.io/new/main).
- Paste the content from the template.
- Name your file, e.g.
  `content/en/blog/2022/short-name-for-your-blog-post/index.md`
- Start editing the markdown file.
- Once your post is ready click on `Propose changes` at the bottom.

## Publication timelines

The OpenTelemetry blog does not follow a strict publication timeline, this
means:

- Your blog post will be published, when it has all the approvals required.
- If you ask for it, we can _postpone_ the publication, but we will **never**
  guarantee publication at or before a certain date.
- Certain blog posts (major announcements) take precedence and may be published
  before your blog post.

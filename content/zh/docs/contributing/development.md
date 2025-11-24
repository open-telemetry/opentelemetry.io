---
title: 开发环境设置与构建、服务等命令
linkTitle: 开发设置与更多内容
description: 了解如何为本网站设置开发环境。
what-next: >
  你现在已经可以开始[构建](#build)、[提供](#serve)并更新网站文件。
weight: 60
default_lang_commit: adc4264c2926e3d767b6a56affb19fb4ae3f2a22 # patched
drifted_from_default: true
---

{{% alert title="支持的构建环境" color=warning %}}

我们正式支持在基于 Linux 的环境和 macOS 上进行构建。至于
[DevContainers](#devcontainers) 等其他环境，我们尽力提供支持。

{{% /alert %}}

以下说明将指导你如何为本网站设置开发环境。

## 云端 IDE 设置 {#cloud-ide-setup}

### Gitpod

通过 [Gitpod.io] 使用开发环境：

1.  Fork 本仓库。参考 [Fork a repository][fork] 获取帮助。
2.  在 [gitpod.io/workspaces] 中创建一个新的工作空间（仅需一次）或在你的
    fork 上打开一个已有的工作空间。你也可以访问以下格式的链接：
    `https://gitpod.io#https://github.com/YOUR_GITHUB_ID/opentelemetry.io`

    > **注意**：如果你有权限直接在此仓库工作，或只是想浏览一下，请打开：
    > <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io>

Gitpod 会自动为你安装与仓库相关的依赖包。
{{% param what-next %}}

### Codespaces

通过 GitHub [Codespaces] 使用开发环境：

1. [Fork] 此网站仓库。
2. 从你的 fork 中打开一个 Codespace。

开发环境将通过 [DevContainer](#devcontainers) 配置初始化。
{{% param what-next %}}

## 本地开发设置 {#local-setup}

1.  [Fork] 并 [克隆][clone] 网站仓库，地址为：<{{% param github_repo %}}>

2.  进入仓库目录：

    ```sh
    cd opentelemetry.io
    ```

3.  安装或升级到 Node.js 的[**当前 LTS 版本**][nodejs-rel]。我们推荐使用
    [nvm] 来管理 Node 安装。在 Linux 下运行以下命令，它会根据 `.nvmrc` 中指定的版本进行安装和升级：

    ```sh
    nvm install
    ```

    若需在 Windows 上[安装 Node.js][nodejs-win]，使用 [nvm-windows]：

    ```cmd
    nvm install lts && nvm use lts
    ```

4.  安装 npm 包和其他依赖项：

    ```sh
    npm install
    ```

启动你喜欢的 IDE。
{{% param what-next %}}

### 构建网站 {#build}

要构建网站，请运行：

```sh
npm run build
```

生成的站点文件将位于 `public` 目录中。

### 启动本地服务 {#serve}

要启动本地服务，请运行：

```sh
npm run serve
```

网站将通过 [localhost:1313] 提供服务。

如果你需要测试 [Netlify] 重定向，请使用以下命令，并访问 [localhost:8888]：

```sh
npm run serve:netlify
```

`serve` 命令是从内存中提供文件，而不是从磁盘读取。

如果你在 macOS 上看到类似 `too many open files` 或 `pipe failed` 的错误，
你可能需要提高文件描述符限制。请参阅 [Hugo issue #6109](https://github.com/gohugoio/hugo/issues/6109)。

### 内容与子模块 {#content-and-submodules}

本网站的构建依赖于以下内容：

- 位于 `content/`、`static/` 等目录下的文件，遵循 [Hugo] 的默认规则；
- 在 [hugo.yaml] 中通过 `mounts` 字段定义的挂载点。这些挂载点来源于
  [content-modules] 目录下的 Git 子模块，或是经过预处理后存放在 `tmp/` 目录中的内容，且仅限这两处来源。

[hugo.yaml]: https://github.com/open-telemetry/opentelemetry.io/blob/bc94737/hugo.yaml
[content-modules]: https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules

### 子模块更改 {#submodule-changes}

如果你更改了某个 [content-modules] 子模块中的任何内容，你需要先向该子模块的仓库提交一个包含这些更改的 PR。
只有当该 PR 被接受后，你才能更新主仓库中的子模块引用，让这些更改体现在本网站中。

管理 `content-modules` 更改的最简单方式，是直接在子模块所关联的上游仓库中操作，而不是在子模块目录内部进行编辑。

有经验的贡献者也可以直接在子模块内工作，你可以立即构建并预览你所做的子模块更改。默认情况下，
CI 脚本在每次执行时都会拉取最新的子模块。如果你不希望每次都这样，可以设置环境变量 `GET=no` 以阻止此行为。
同时，在提交 PR 前需要对该子模块运行 `git fetch --unshallow`。或者，你也可以设置 `DEPTH=100` 并重新拉取子模块。

## DevContainer 支持 {#devcontainers}

本仓库已配置为支持[开发容器][devcontainers]，这些容器可用于多种云端或本地 IDE，包括（按字母排序）：

- [Codespaces][cs-devc]
- [DevPod](https://devpod.sh/docs/developing-in-workspaces/devcontainer-json)
- [Gitpod](https://www.gitpod.io/docs/flex/configuration/devcontainer/overview)
- [VSCode](https://code.visualstudio.com/docs/devcontainers/containers#_installation)

[clone]: https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
[codespaces]: https://docs.github.com/en/codespaces
[cs-devc]: https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers#about-dev-containers
[devcontainers]: https://containers.dev/
[fork]: https://docs.github.com/en/get-started/quickstart/fork-a-repo
[gitpod.io]: https://gitpod.io
[gitpod.io/workspaces]: https://gitpod.io/workspaces
[hugo]: https://gohugo.io
[localhost:1313]: http://localhost:1313
[localhost:8888]: http://localhost:8888
[netlify]: https://netlify.com
[nodejs-rel]: https://nodejs.org/en/about/previous-releases
[nodejs-win]: https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows
[nvm]: https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating
[nvm-windows]: https://github.com/coreybutler/nvm-windows

<!-- markdownlint-disable link-image-reference-definitions -->

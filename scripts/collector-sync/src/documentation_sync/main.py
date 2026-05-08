"""Main entry point for documentation sync automation."""

import argparse
import logging
import sys
from pathlib import Path

from documentation_sync.component_data_generator import ComponentDataGenerator
from documentation_sync.explorer_repository_manager import ExplorerRepositoryManager
from documentation_sync.inventory_manager import InventoryManager
from documentation_sync.metadata_diagnostics import MetadataDiagnostics
from documentation_sync.update_docs import get_latest_version, merge_inventories
from documentation_sync.version_updater import VersionUpdater

logger = logging.getLogger(__name__)


def find_repo_root() -> Path:
    """Find the opentelemetry.io repository root.

    Searches upward from current directory for indicators of the repo root.

    Returns:
        Path to repository root

    Raises:
        RuntimeError: If repository root cannot be found
    """
    current = Path.cwd()

    # Search upward for repo root indicators
    for path in [current, *current.parents]:
        # Hugo config is in config/_default/ and content is in content/en/
        has_hugo_config = (path / "config" / "_default").exists()
        has_content = (path / "content" / "en").exists()

        if has_hugo_config and has_content:
            return path

    raise RuntimeError(
        "Could not find opentelemetry.io repository root. "
        "Please run from within the repository (looking for config/_default/ and content/en/)."
    )


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )


def main() -> None:
    """Update docs in local opentelemetry.io repository."""
    configure_logging()

    parser = argparse.ArgumentParser(
        description="Update OpenTelemetry documentation with latest collector component data",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--no-update",
        action="store_true",
        help="Skip updating the ecosystem-explorer repository (use existing clone)",
    )
    args = parser.parse_args()

    logger.info("=" * 60)
    logger.info("Documentation Sync")
    logger.info("=" * 60)
    logger.info("")

    # Find and change to repository root
    try:
        repo_root = find_repo_root()
        logger.info(f"Repository root: {repo_root}")
        import os
        os.chdir(repo_root)
        logger.info(f"Changed working directory to: {Path.cwd()}")
    except RuntimeError as e:
        logger.error(f"❌ {e}")
        sys.exit(1)

    # Clone/update ecosystem-explorer repository to access registry
    logger.info("\nSetting up ecosystem-explorer repository...")
    explorer_manager = ExplorerRepositoryManager()
    try:
        if not args.no_update:
            explorer_repo_path = explorer_manager.ensure_repository()
            logger.info(f"✓ Explorer repository ready at {explorer_repo_path}")
        else:
            explorer_repo_path = explorer_manager.clone_path
            logger.info(f"Using existing explorer repository at {explorer_repo_path}")
    except Exception as e:
        logger.error(f"❌ Failed to setup explorer repository: {e}")
        sys.exit(1)

    # Initialize inventory manager with path to registry in cloned explorer repo
    registry_path = explorer_manager.get_registry_path()
    inventory_manager = InventoryManager(str(registry_path))

    contrib_version = get_latest_version(inventory_manager, "contrib")
    core_version = get_latest_version(inventory_manager, "core")

    core_inventory = inventory_manager.load_versioned_inventory("core", core_version)
    contrib_inventory = inventory_manager.load_versioned_inventory("contrib", contrib_version)

    merged_inventory = merge_inventories(core_inventory, contrib_inventory)

    total_components = sum(len(comps) for comps in merged_inventory["components"].values())
    logger.info(f"Loaded {total_components} total components")

    # Format versions as tags (e.g., v0.115.0)
    core_version_tag = f"v{core_version}"
    contrib_version_tag = f"v{contrib_version}"

    logger.info("\nUpdating collector versions data file...")
    version_updater = VersionUpdater(repo_root)
    version_updater.update_versions(core_version_tag, contrib_version_tag)

    logger.info("\nGenerating component data files for Hugo...")
    diagnostics = MetadataDiagnostics()
    data_generator = ComponentDataGenerator(diagnostics)
    data_generator.write_component_data_files(merged_inventory, repo_root)
    logger.info("✅ Component data files generated")

    logger.info("\n" + "=" * 60)
    logger.info("Metadata Quality Report")
    logger.info("=" * 60 + "\n")

    if diagnostics.has_issues():
        logger.warning(diagnostics.generate_summary())

        # Save GitHub issue body to file for automatic issue creation
        issue_body = diagnostics.generate_github_issue_body()
        issue_file = Path("metadata-issues.md")
        issue_file.write_text(issue_body)
        logger.info(f"\n📄 Detailed report saved to: {issue_file.absolute()}")
    else:
        logger.info("✅ No metadata issues found - all components have complete metadata")


if __name__ == "__main__":
    main()

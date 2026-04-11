"""Updates collector version data file."""

import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class VersionUpdater:
    """Updates the collector versions data file."""

    def __init__(self, repo_root: Path):
        """
        Initialize the version updater.

        Args:
            repo_root: Path to the opentelemetry.io repository root
        """
        self.data_file_path = repo_root / "data" / "collector-versions.yml"

    def update_versions(self, core_version: str, contrib_version: str) -> bool:
        """
        Update the collector versions data file.

        Args:
            core_version: Version string for core distribution (e.g., "v0.115.0")
            contrib_version: Version string for contrib distribution (e.g., "v0.115.0")

        Returns:
            True if update was successful, False otherwise
        """
        try:
            content = f"""# OpenTelemetry Collector distribution versions
# This file is automatically updated by scripts/collector-sync

core: {core_version}
contrib: {contrib_version}
"""

            self.data_file_path.write_text(content)
            logger.info(f"✓ Updated versions in {self.data_file_path.relative_to(self.data_file_path.parent.parent.parent)}")
            logger.info(f"  - core: {core_version}")
            logger.info(f"  - contrib: {contrib_version}")

            return True

        except Exception as e:
            logger.error(f"Error updating version file: {e}")
            return False

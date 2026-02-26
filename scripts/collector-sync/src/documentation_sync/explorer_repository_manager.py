"""Manager for cloning and updating the ecosystem-explorer repository."""

import logging
from pathlib import Path
from typing import Optional

from git import Repo
from git.exc import GitCommandError

logger = logging.getLogger(__name__)


class ExplorerRepositoryManager:
    """Manages cloning and updating the opentelemetry-ecosystem-explorer repository."""

    EXPLORER_REPO_URL = "https://github.com/open-telemetry/opentelemetry-ecosystem-explorer.git"
    DEFAULT_CLONE_PATH = Path("tmp_repos/opentelemetry-ecosystem-explorer")

    def __init__(self, clone_path: Optional[Path] = None):
        """Initialize the repository manager.

        Args:
            clone_path: Path where the repository should be cloned.
                       Defaults to tmp_repos/opentelemetry-ecosystem-explorer
        """
        self.clone_path = clone_path or self.DEFAULT_CLONE_PATH
        self._repo: Optional[Repo] = None

    def ensure_repository(self) -> Path:
        """Ensure the repository is cloned and up to date.

        Returns:
            Path to the cloned repository.

        Raises:
            GitCommandError: If git operations fail.
        """
        if self._is_repository_cloned():
            logger.info(f"Repository already exists at {self.clone_path}")
            self._update_repository()
        else:
            logger.info(f"Cloning repository to {self.clone_path}")
            self._clone_repository()

        return self.clone_path

    def _is_repository_cloned(self) -> bool:
        """Check if the repository is already cloned."""
        git_dir = self.clone_path / ".git"
        return git_dir.exists() and git_dir.is_dir()

    def _clone_repository(self) -> None:
        """Clone the repository."""
        self.clone_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            self._repo = Repo.clone_from(self.EXPLORER_REPO_URL, self.clone_path)
            logger.info(f"Successfully cloned repository to {self.clone_path}")
        except GitCommandError as e:
            logger.error(f"Failed to clone repository: {e}")
            raise

    def _update_repository(self) -> None:
        """Update the repository to the latest version."""
        try:
            if self._repo is None:
                self._repo = Repo(self.clone_path)

            if self._repo.active_branch.name != "main":
                logger.info("Checking out main branch")
                self._repo.git.checkout("main")

            logger.info("Pulling latest changes")
            origin = self._repo.remotes.origin
            origin.pull()
            logger.info("Successfully updated repository")
        except GitCommandError as e:
            logger.error(f"Failed to update repository: {e}")
            raise

    def get_registry_path(self) -> Path:
        """Get the path to the collector registry directory.

        Returns:
            Path to ecosystem-registry/collector directory.
        """
        return self.clone_path / "ecosystem-registry" / "collector"

    def get_repo(self) -> Repo:
        """Get the git repository object.

        Returns:
            GitPython Repo object.

        Raises:
            RuntimeError: If repository hasn't been cloned yet.
        """
        if self._repo is None:
            if self._is_repository_cloned():
                self._repo = Repo(self.clone_path)
            else:
                raise RuntimeError(
                    "Repository not cloned. Call ensure_repository() first."
                )
        return self._repo

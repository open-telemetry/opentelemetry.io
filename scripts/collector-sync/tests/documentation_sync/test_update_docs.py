"""Tests for update_docs functionality."""

from pathlib import Path

import pytest
from documentation_sync.inventory_manager import InventoryManager
from documentation_sync.update_docs import get_latest_version, merge_inventories
from semantic_version import Version


@pytest.fixture
def fixtures_dir() -> Path:
    """Return path to test fixtures directory."""
    return Path(__file__).parent / "fixtures"


class TestGetLatestVersion:
    def test_get_latest_release_version(self, fixtures_dir: Path) -> None:
        """Test getting the latest non-prerelease version."""
        inv_mgr = InventoryManager(str(fixtures_dir))

        result = get_latest_version(inv_mgr, "core")

        # Should return latest non-snapshot version
        assert result == Version("0.140.0")

    def test_no_versions_available(self, fixtures_dir: Path) -> None:
        """Test when no versions are available."""
        inv_mgr = InventoryManager(str(fixtures_dir))

        # Try to get version for a distribution that doesn't exist
        with pytest.raises(SystemExit):
            get_latest_version(inv_mgr, "nonexistent")  # type: ignore

    def test_skips_prerelease_versions(self, fixtures_dir: Path) -> None:
        """Test that prerelease/snapshot versions are skipped."""
        inv_mgr = InventoryManager(str(fixtures_dir))

        result = get_latest_version(inv_mgr, "contrib")

        # Should skip v0.141.0-snapshot and return v0.140.1
        assert result == Version("0.140.1")
        assert not result.prerelease


class TestMergeInventories:
    """Tests for merge_inventories function."""

    def test_merge_basic(self) -> None:
        """Test basic merging of core and contrib inventories."""
        core_inventory = {
            "components": {
                "extension": [
                    {
                        "name": "memorylimiterextension",
                        "metadata": {
                            "status": {
                                "distributions": [],
                                "stability": {"development": ["extension"]},
                            }
                        },
                    }
                ]
            }
        }

        contrib_inventory = {
            "components": {
                "extension": [
                    {
                        "name": "ackextension",
                        "metadata": {
                            "status": {
                                "distributions": ["contrib"],
                                "stability": {"alpha": ["extension"]},
                            }
                        },
                    }
                ]
            }
        }

        result = merge_inventories(core_inventory, contrib_inventory)

        extensions = result["components"]["extension"]
        assert len(extensions) == 2
        assert any(e["name"] == "memorylimiterextension" for e in extensions)
        assert any(e["name"] == "ackextension" for e in extensions)

    def test_merge_overlapping_components(self) -> None:
        """Test merging when same component exists in both."""
        core_inventory = {
            "components": {
                "receiver": [
                    {
                        "name": "otlpreceiver",
                        "metadata": {
                            "status": {
                                "distributions": ["core"],
                                "stability": {"stable": ["traces", "metrics", "logs"]},
                            }
                        },
                    }
                ]
            }
        }

        contrib_inventory = {
            "components": {
                "receiver": [
                    {
                        "name": "otlpreceiver",
                        "metadata": {
                            "status": {
                                "distributions": ["contrib"],
                                "stability": {"stable": ["traces", "metrics", "logs"]},
                            }
                        },
                    }
                ]
            }
        }

        result = merge_inventories(core_inventory, contrib_inventory)

        receivers = result["components"]["receiver"]
        assert len(receivers) == 1
        receiver = receivers[0]
        assert receiver["name"] == "otlpreceiver"
        assert receiver["source_repo"] == "core"  # Should prefer core
        assert set(receiver["metadata"]["status"]["distributions"]) == {"core", "contrib"}

    def test_merge_skips_experimental_components(self) -> None:
        """Test that experimental 'x' components are skipped."""
        core_inventory = {
            "components": {
                "receiver": [
                    {
                        "name": "xreceiver",  # Experimental, should be skipped
                        "metadata": {},
                    },
                    {
                        "name": "otlpreceiver",
                        "metadata": {
                            "status": {
                                "distributions": ["core"],
                            }
                        },
                    },
                ]
            }
        }

        contrib_inventory = {"components": {"receiver": []}}

        result = merge_inventories(core_inventory, contrib_inventory)

        receivers = result["components"]["receiver"]
        assert len(receivers) == 1
        assert receivers[0]["name"] == "otlpreceiver"

    def test_merge_empty_inventories(self) -> None:
        """Test merging when one inventory is empty."""
        core_inventory = {"components": {}}
        contrib_inventory = {
            "components": {
                "receiver": [
                    {
                        "name": "zipkinreceiver",
                        "metadata": {},
                    }
                ]
            }
        }

        result = merge_inventories(core_inventory, contrib_inventory)

        assert len(result["components"]["receiver"]) == 1
        assert result["components"]["receiver"][0]["name"] == "zipkinreceiver"

    def test_merge_preserves_source_repo(self) -> None:
        """Test that source_repo is correctly set."""
        core_inventory = {
            "components": {
                "receiver": [
                    {
                        "name": "corereceiver",
                        "metadata": {},
                    }
                ]
            }
        }

        contrib_inventory = {
            "components": {
                "receiver": [
                    {
                        "name": "contribreceiver",
                        "metadata": {},
                    }
                ]
            }
        }

        result = merge_inventories(core_inventory, contrib_inventory)

        receivers = result["components"]["receiver"]
        core_rec = next(r for r in receivers if r["name"] == "corereceiver")
        contrib_rec = next(r for r in receivers if r["name"] == "contribreceiver")

        assert core_rec["source_repo"] == "core"
        assert contrib_rec["source_repo"] == "contrib"

    def test_merge_sorts_components(self) -> None:
        """Test that merged components are sorted by name."""
        core_inventory = {
            "components": {
                "receiver": [
                    {"name": "zreceiver", "metadata": {}},
                    {"name": "areceiver", "metadata": {}},
                ]
            }
        }

        contrib_inventory = {
            "components": {
                "receiver": [
                    {"name": "mreceiver", "metadata": {}},
                ]
            }
        }

        result = merge_inventories(core_inventory, contrib_inventory)

        receivers = result["components"]["receiver"]
        names = [r["name"] for r in receivers]
        assert names == ["areceiver", "mreceiver", "zreceiver"]

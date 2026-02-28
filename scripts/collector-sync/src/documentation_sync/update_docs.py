"""
Update documentation pages.

This script updates OpenTelemetry Collector component documentation tables
in a local opentelemetry.io repository using marker-based updates.
"""

import logging
import sys

from documentation_sync.inventory_manager import InventoryManager
from documentation_sync.type_defs import DistributionName
from semantic_version import Version

logger = logging.getLogger(__name__)


def get_latest_version(inventory_manager: InventoryManager, distribution: DistributionName) -> Version:
    versions = inventory_manager.list_versions(distribution)
    if not versions:
        logger.error(f"❌ No versions found for {distribution} distribution in inventory.")
        sys.exit(1)

    release_versions = [v for v in versions if not v.prerelease]
    if not release_versions:
        logger.error(f"❌ No release versions found for {distribution} distribution in inventory.")
        sys.exit(1)

    version = release_versions[0]

    logger.info(f"{distribution.capitalize()} Target version: {version}")
    return version


def _is_experimental_component(name: str, component_type: str) -> bool:
    """Check if component is experimental (x-prefixed)."""
    return name == f"x{component_type}"


def _get_distributions(component: dict) -> list[str]:
    """Extract distributions list from component metadata."""
    return component.get("metadata", {}).get("status", {}).get("distributions", [])


def _merge_component_metadata(existing: dict, new: dict) -> None:
    """
    Merge metadata from new component into existing component.

    Updates existing component in-place with merged distributions.
    """
    existing_dists = _get_distributions(existing)
    new_dists = _get_distributions(new)

    all_dists = sorted(set(existing_dists) | set(new_dists))

    if new.get("metadata") and not existing.get("metadata"):
        existing["metadata"] = new["metadata"].copy()

    if "metadata" not in existing:
        existing["metadata"] = {}
    if "status" not in existing["metadata"]:
        existing["metadata"]["status"] = {}
    existing["metadata"]["status"]["distributions"] = all_dists


def _add_component_to_map(component_map: dict, component: dict, source_repo: str, component_type: str) -> None:
    """
    Add or merge a component into the component map.

    Args:
        component_map: Dictionary mapping component names to component data
        component: Component to add
        source_repo: Source repository ("core" or "contrib")
        component_type: Type of component (receiver, processor, etc.)
    """
    name = component.get("name")

    if _is_experimental_component(name, component_type):
        return

    if name in component_map:
        _merge_component_metadata(component_map[name], component)
    else:
        component_copy = component.copy()
        component_copy["source_repo"] = source_repo
        component_map[name] = component_copy


def merge_inventories(core_inventory: dict, contrib_inventory: dict) -> dict:
    """
    Merge core and contrib inventories into a unified inventory.

    Components in both distributions will have their metadata merged,
    with distributions list showing both.

    Args:
        core_inventory: Core distribution inventory
        contrib_inventory: Contrib distribution inventory

    Returns:
        Merged inventory with unified components
    """
    merged = {"components": {}}

    all_types = set(core_inventory.get("components", {}).keys()) | set(contrib_inventory.get("components", {}).keys())

    for component_type in all_types:
        core_comps = core_inventory.get("components", {}).get(component_type, [])
        contrib_comps = contrib_inventory.get("components", {}).get(component_type, [])

        component_map = {}

        for component in core_comps:
            _add_component_to_map(component_map, component, "core", component_type)

        for component in contrib_comps:
            _add_component_to_map(component_map, component, "contrib", component_type)

        merged["components"][component_type] = sorted(component_map.values(), key=lambda c: c.get("name", ""))

    return merged

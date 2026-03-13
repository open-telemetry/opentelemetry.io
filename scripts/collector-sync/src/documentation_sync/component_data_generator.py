"""Generate YAML data files for Hugo rendering of component tables."""

from pathlib import Path
from typing import Any

import yaml


class ComponentDataGenerator:
    """Generates component data files for translation-friendly Hugo rendering."""

    def __init__(self) -> None:
        """Initialize the data generator."""
        pass

    @staticmethod
    def _get_distributions(component: dict[str, Any]) -> list[str]:
        """
        Get the list of distributions for a component.

        Args:
            component: Component data

        Returns:
            List of distribution names (e.g., ["core", "contrib"])
        """
        metadata = component.get("metadata", {})
        status = metadata.get("status", {})
        distributions = status.get("distributions", [])

        if not distributions:
            # Use source_repo as fallback when distributions are empty
            source_repo = component.get("source_repo", "contrib")
            return [source_repo]

        return sorted(distributions)

    @staticmethod
    def _get_stability_by_signal(metadata: dict[str, Any]) -> dict[str, str]:
        """
        Get stability information by signal type.

        Args:
            metadata: Component metadata containing status.stability

        Returns:
            Dictionary mapping signal type to stability level
            For extensions: {"extension": "beta"}
            For others: {"traces": "beta", "metrics": "alpha", "logs": "-"}
        """
        if not metadata or "status" not in metadata:
            return {}

        status = metadata.get("status", {})
        stability = status.get("stability", {})

        if not stability:
            return {}

        signal_stability = {}
        for level, signals in stability.items():
            if isinstance(signals, list):
                for signal in signals:
                    signal_stability[signal] = level

        return signal_stability

    @staticmethod
    def _is_unmaintained(component: dict[str, Any]) -> bool:
        """
        Check if a component is unmaintained.

        A component is considered unmaintained if any of its signals
        have an "unmaintained" stability level.

        Args:
            component: Component data

        Returns:
            True if component is unmaintained
        """
        metadata = component.get("metadata", {})
        if not metadata:
            return False

        status = metadata.get("status", {})
        stability = status.get("stability", {})

        return "unmaintained" in stability

    def _generate_component_data(self, component: dict[str, Any]) -> dict[str, Any]:
        """
        Generate data dictionary for a single component.

        Args:
            component: Component metadata

        Returns:
            Dictionary with component data for YAML output
        """
        name = component.get("name", "unknown")
        source_repo = component.get("source_repo", "contrib")
        metadata = component.get("metadata", {})
        subtype = component.get("subtype")

        distributions = self._get_distributions(component)
        stability = self._get_stability_by_signal(metadata)
        unmaintained = self._is_unmaintained(component)

        # Build minimal data structure
        data = {
            "name": name,
            "repo": source_repo,
            "distributions": distributions,
            "stability": stability,
        }

        # Only include optional fields if they have values
        if unmaintained:
            data["unmaintained"] = True

        if subtype:
            data["subtype"] = subtype

        return data

    def generate_component_type_data(
        self, component_type: str, components: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """
        Generate data for all components of a specific type.

        Args:
            component_type: Type of component (receiver, processor, etc.)
            components: List of components of this type

        Returns:
            List of component data dictionaries, sorted by name
        """
        data = []
        for component in components:
            component_data = self._generate_component_data(component)
            data.append(component_data)

        # Sort by name for consistent output
        return sorted(data, key=lambda c: c.get("name", ""))

    def write_component_data_files(self, inventory: dict[str, Any], output_dir: Path) -> None:
        """
        Write component data files for all component types.

        Creates data files at:
        - data/collector/receivers.yml
        - data/collector/exporters.yml
        - data/collector/processors.yml
        - data/collector/connectors.yml
        - data/collector/extensions.yml

        Args:
            inventory: Complete inventory data with components
            output_dir: Repository root directory (contains data/ folder)
        """
        collector_dir = output_dir / "data" / "collector"
        collector_dir.mkdir(parents=True, exist_ok=True)

        components = inventory.get("components", {})

        for component_type in ["receiver", "processor", "exporter", "connector", "extension"]:
            component_list = components.get(component_type, [])
            data = self.generate_component_type_data(component_type, component_list)

            # Write to data/collector/{type}s.yml (plural form)
            output_file = collector_dir / f"{component_type}s.yml"

            with open(output_file, "w", encoding="utf-8") as f:
                # Write with nice formatting
                yaml.dump(
                    data,
                    f,
                    default_flow_style=False,
                    allow_unicode=True,
                    sort_keys=False,
                    explicit_start=True,
                    width=100,
                )

            print(f"  ✓ {output_file.relative_to(output_dir)}")
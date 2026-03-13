"""Generate YAML data files for Hugo rendering of component tables."""

from pathlib import Path
from typing import Any

import yaml

from documentation_sync import component_utils
from documentation_sync.metadata_diagnostics import MetadataDiagnostics


class ComponentDataGenerator:
    """Generates component data files."""

    def __init__(self, diagnostics: MetadataDiagnostics | None = None) -> None:
        """
        Initialize the data generator.

        Args:
            diagnostics: Optional diagnostics tracker to record metadata issues
        """
        self.diagnostics = diagnostics

    def _generate_component_data(
        self, component: dict[str, Any], component_type: str
    ) -> dict[str, Any]:
        """
        Generate data dictionary for a single component.

        Args:
            component: Component metadata
            component_type: Type of component (receiver, processor, etc.)

        Returns:
            Dictionary with component data for YAML output
        """
        name = component.get("name", "unknown")
        source_repo = component.get("source_repo", "contrib")
        metadata = component.get("metadata", {})
        subtype = component.get("subtype")

        distributions = component_utils.get_distributions(component)
        stability = component_utils.get_stability_by_signal(
            metadata, component, component_type, self.diagnostics
        )
        unmaintained = component_utils.is_unmaintained(component)

        data = {
            "name": name,
            "repo": source_repo,
            "distributions": distributions,
            "stability": stability,
        }

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
            component_data = self._generate_component_data(component, component_type)
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

            # data/collector/{type}s.yml
            output_file = collector_dir / f"{component_type}s.yml"

            with open(output_file, "w", encoding="utf-8") as f:
                f.write("# OpenTelemetry Collector distribution versions\n")
                f.write("# This file is automatically updated by scripts/collector-sync\n\n")

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

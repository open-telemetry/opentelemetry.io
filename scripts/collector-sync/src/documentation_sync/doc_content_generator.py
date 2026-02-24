"""Documentation generator for OpenTelemetry Collector components."""

from typing import Any

from documentation_sync.metadata_diagnostics import MetadataDiagnostics


class DocContentGenerator:
    """Generates component tables for marker-based documentation updates."""

    # Subtypes that should be rendered as separate tables
    EXTENSION_SUBTYPES = ["encoding", "observer", "storage"]

    def __init__(self, diagnostics: MetadataDiagnostics):
        """
        Initialize the content generator.

        Args:
            diagnostics: Diagnostics tracker to record metadata issues
        """
        self.diagnostics = diagnostics

    def get_stability_by_signal(
        self, metadata: dict[str, Any], component: dict[str, Any] | None = None, component_type: str | None = None
    ) -> dict[str, str]:
        """
        Get stability information by signal type.

        Args:
            metadata: Component metadata containing status.stability
            component: Full component data (for diagnostics)
            component_type: Type of component (for diagnostics)

        Returns:
            Dictionary mapping signal type to stability level
            For extensions: {"extension": "beta"}
            For others: {"traces": "beta", "metrics": "alpha", "logs": "-"}
        """
        if not metadata or "status" not in metadata:
            if component and component_type:
                # Check if component is missing metadata field entirely
                if "metadata" not in component:
                    self.diagnostics.record_missing_metadata(component, component_type)
                else:
                    self.diagnostics.record_missing_status(component, component_type)
            return {}

        status = metadata.get("status", {})
        stability = status.get("stability", {})

        if not stability:
            if component and component_type:
                self.diagnostics.record_missing_stability(component, component_type)
            return {}

        signal_stability = {}
        for level, signals in stability.items():
            if isinstance(signals, list):
                for signal in signals:
                    signal_stability[signal] = level

        return signal_stability

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
    def _format_distributions(distributions: list[str]) -> str:
        """
        Format distribution list for display in table.

        Args:
            distributions: List of distribution names

        Returns:
            Formatted string (e.g., "core, contrib")
        """
        if not distributions:
            return "-"

        # Capitalize distribution names to match textlint terminology rules
        # (e.g., "k8s" -> "K8s")
        capitalized = []
        for dist in distributions:
            if dist.lower() == "k8s":
                capitalized.append("K8s")
            else:
                capitalized.append(dist)

        return ", ".join(capitalized)

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

    @staticmethod
    def _filter_by_subtype(components: list[dict[str, Any]], subtype: str | None) -> list[dict[str, Any]]:
        """
        Filter components by subtype.

        Args:
            components: List of components
            subtype: Subtype to filter by (None means components without subtype)

        Returns:
            Filtered list of components
        """
        if subtype is None:
            # Return components without a subtype
            return [c for c in components if c.get("subtype") is None]
        else:
            return [c for c in components if c.get("subtype") == subtype]

    @staticmethod
    def _generate_table_header(component_type: str) -> str:
        """Generate table header for a component type."""
        if component_type == "extension":
            return "| Name | Distributions[^1] | Stability[^2] |\n|------|-------------------|---------------|"
        elif component_type == "connector":
            return "| Name | Distributions[^1] |\n|------|-------------------|"
        else:
            return (
                "| Name | Distributions[^1] | Traces[^2] | Metrics[^2] | Logs[^2] |\n"
                "|------|-------------------|------------|-------------|----------|"
            )

    @staticmethod
    def _build_component_url(component_type: str, name: str, source_repo: str, subtype: str | None) -> str:
        """Build GitHub URL for component."""
        repo_name = "opentelemetry-collector" if source_repo == "core" else "opentelemetry-collector-contrib"
        repo_url = f"https://github.com/open-telemetry/{repo_name}"

        if subtype:
            component_path = f"{component_type}/{subtype}/{name}"
        else:
            component_path = f"{component_type}/{name}"

        return f"{repo_url}/tree/main/{component_path}"

    def _generate_table_row(self, component_type: str, component: dict[str, Any], subtype: str | None = None) -> str:
        """Generate a single table row for a component."""
        name = component.get("name", "unknown")
        metadata = component.get("metadata", {})
        source_repo = component.get("source_repo", "contrib")

        distributions = self._get_distributions(component)
        distributions_str = self._format_distributions(distributions)
        stability_map = self.get_stability_by_signal(metadata, component, component_type)

        readme_link = self._build_component_url(component_type, name, source_repo, subtype)
        name_link = f"[{name}]({readme_link})"

        # connectors don't use the stability mechanism the same way as other components
        # so they don't mark unmaintained components
        if component_type != "connector" and self._is_unmaintained(component):
            name_link += " ⚠️"

        # extensions have a single stability level compared to others which have per-signal levels
        if component_type == "extension":
            stability = stability_map.get("extension", "N/A")
            return f"| {name_link} | {distributions_str} | {stability} |"
        elif component_type == "connector":
            # connectors have a completely different stability model
            return f"| {name_link} | {distributions_str} |"
        else:
            traces = stability_map.get("traces", "-")
            metrics = stability_map.get("metrics", "-")
            logs = stability_map.get("logs", "-")
            return f"| {name_link} | {distributions_str} | {traces} | {metrics} | {logs} |"

    def _generate_component_table(
        self,
        component_type: str,
        components: list[dict[str, Any]],
        subtype: str | None = None,
        include_footnotes: bool = True,
    ) -> str:
        """
        Generate a table of components with distributions column.

        Args:
            component_type: Type of component (receiver, processor, etc.)
            components: List of components to include in table
            subtype: Optional subtype for nested components (e.g., "encoding")
            include_footnotes: Whether to include footnote definitions (default True).
                              Set to False for subtype tables to avoid duplicate footnotes.

        Returns:
            Markdown table content
        """
        table_lines = [self._generate_table_header(component_type)]

        for component in components:
            table_lines.append(self._generate_table_row(component_type, component, subtype))

        table_content = "\n".join(table_lines) + "\n"

        if include_footnotes:
            table_content += "\n" + self.generate_footnotes(component_type)

        return table_content

    def generate_component_table(
        self,
        component_type: str,
        components: list[dict[str, Any]],
        subtype: str | None = None,
        include_footnotes: bool = True,
    ) -> str:
        """
        Generate table content for a component type (for marker-based updates).

        Args:
            component_type: Type of component (receiver, processor, etc.)
            components: List of components of this type
            subtype: Optional subtype to filter by (e.g., "encoding")
            include_footnotes: Whether to include footnote definitions (default True)

        Returns:
            Markdown table content (no front matter or headers)
        """
        # Filter by subtype if specified
        filtered = self._filter_by_subtype(components, subtype)
        sorted_components = sorted(filtered, key=lambda c: c.get("name", ""))
        return self._generate_component_table(
            component_type, sorted_components, subtype=subtype, include_footnotes=include_footnotes
        )

    @staticmethod
    def generate_footnotes(component_type: str) -> str:
        """
        Generate footnotes section for a component type.

        Args:
            component_type: Type of component (receiver, processor, etc.)

        Returns:
            Markdown footnotes content
        """
        stability_link = (
            "https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/component-stability.md"
        )

        # Footnotes use multi-line indented format to match existing docs
        footnotes = "[^1]:\n"
        footnotes += "    Shows which [distributions](/docs/collector/distributions/) (core, contrib,\n"
        footnotes += "    K8s, etc.) include this component.\n"

        # Only add stability footnote for non-connector components
        if component_type != "connector":
            footnotes += "\n[^2]:\n"
            footnotes += "    For details about component stability levels, see the\n"
            footnotes += f"    [OpenTelemetry Collector component stability definitions]({stability_link}).\n"

        return footnotes

    def generate_all_component_tables(self, inventory: dict[str, Any]) -> dict[str, str]:
        """
        Generate table content for all component types (for marker-based updates).

        Args:
            inventory: Complete inventory data

        Returns:
            Dictionary mapping marker_id to table content.
            For extensions with subtypes, includes separate tables like:
            - "extension" - main extensions (no subtype, no footnotes)
            - "extension-encoding" - encoding extensions (no footnotes)
            - "extension-observer" - observer extensions (no footnotes)
            - "extension-storage" - storage extensions (no footnotes)
            - "extension-footnotes" - shared footnotes for all extension tables

            Extension footnotes are generated separately so they can be placed
            at the bottom of the page.
        """
        tables = {}
        components = inventory.get("components", {})

        for component_type in ["receiver", "processor", "exporter", "connector"]:
            component_list = components.get(component_type, [])
            tables[component_type] = self.generate_component_table(component_type, component_list)

        # Handle extensions specially - separate main extensions from subtypes
        extension_list = components.get("extension", [])

        # Main extensions table (components without subtype) - NO footnotes
        tables["extension"] = self.generate_component_table(
            "extension", extension_list, subtype=None, include_footnotes=False
        )

        # Subtype tables for extensions - no footnotes
        for subtype in self.EXTENSION_SUBTYPES:
            subtype_components = self._filter_by_subtype(extension_list, subtype)
            if subtype_components:
                # Use marker_id like "extension-encoding"
                marker_id = f"extension-{subtype}"
                tables[marker_id] = self.generate_component_table(
                    "extension", extension_list, subtype=subtype, include_footnotes=False
                )

        # Generate shared footnotes for extension page (at the bottom)
        tables["extension-footnotes"] = self.generate_footnotes("extension")

        return tables

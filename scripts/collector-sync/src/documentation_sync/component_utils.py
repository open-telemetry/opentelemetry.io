"""Shared utility functions for OpenTelemetry Collector component processing."""

from typing import Any

from documentation_sync.metadata_diagnostics import MetadataDiagnostics


def get_stability_by_signal(
    metadata: dict[str, Any],
    component: dict[str, Any] | None = None,
    component_type: str | None = None,
    diagnostics: MetadataDiagnostics | None = None,
) -> dict[str, str]:
    """
    Get stability information by signal type.

    Args:
        metadata: Component metadata containing status.stability
        component: Full component data (for diagnostics)
        component_type: Type of component (for diagnostics)
        diagnostics: Optional diagnostics tracker to record metadata issues

    Returns:
        Dictionary mapping signal type to stability level
        For extensions: {"extension": "beta"}
        For others: {"traces": "beta", "metrics": "alpha", "logs": "-"}
    """
    if not metadata or "status" not in metadata:
        if diagnostics and component and component_type:
            # Check if component is missing metadata field entirely
            if "metadata" not in component:
                diagnostics.record_missing_metadata(component, component_type)
            else:
                diagnostics.record_missing_status(component, component_type)
        return {}

    status = metadata.get("status", {})
    stability = status.get("stability", {})

    if not stability:
        if diagnostics and component and component_type:
            diagnostics.record_missing_stability(component, component_type)
        return {}

    signal_stability = {}
    for level, signals in stability.items():
        if isinstance(signals, list):
            for signal in signals:
                signal_stability[signal] = level

    return signal_stability


def get_distributions(component: dict[str, Any]) -> list[str]:
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


def is_unmaintained(component: dict[str, Any]) -> bool:
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

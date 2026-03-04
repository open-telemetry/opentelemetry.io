"""Update existing documentation files with generated content using markers."""

import re
from pathlib import Path


class DocMarkerUpdater:
    def __init__(
        self, marker_prefix: str = "GENERATED", source: str = "scripts/collector-sync"
    ):
        """
        Args:
            marker_prefix: Prefix for marker comments (default: "GENERATED")
            source: Source identifier for the markers (default: "scripts/collector-sync")
        """
        self.marker_prefix = marker_prefix
        self.source = source

    def get_marker_pattern(self, marker_id: str) -> tuple[str, str]:
        """
        Get the begin and end marker strings for a given marker ID.

        Args:
            marker_id: Unique identifier for the marker (e.g., "receiver-table")

        Returns:
            Tuple of (begin_marker, end_marker)
        """
        begin = f"<!-- BEGIN {self.marker_prefix}: {marker_id} SOURCE: {self.source} -->"
        end = f"<!-- END {self.marker_prefix}: {marker_id} SOURCE: {self.source} -->"
        return begin, end

    def _build_marker_regex(self, marker_id: str) -> re.Pattern:
        """
        Build regex pattern to match marker section.

        Matches patterns like:
            <!-- BEGIN GENERATED: marker-id -->
            <!-- BEGIN GENERATED: marker-id SOURCE: open-telemetry/repo -->

        Args:
            marker_id: Marker identifier

        Returns:
            Compiled regex pattern
        """
        begin_pattern = (
            re.escape(f"<!-- BEGIN {self.marker_prefix}: {marker_id}")
            + r"(?:\s+SOURCE:\s+[\w\-/.]+)?"
            + re.escape(" -->")
        )
        end_pattern = (
            re.escape(f"<!-- END {self.marker_prefix}: {marker_id}")
            + r"(?:\s+SOURCE:\s+[\w\-/.]+)?"
            + re.escape(" -->")
        )

        pattern = begin_pattern + r".*?" + end_pattern
        return re.compile(pattern, re.DOTALL)

    def update_section(self, content: str, marker_id: str, new_content: str) -> tuple[str, bool]:
        """
        Update a section of content between markers.

        Args:
            content: Original markdown content
            marker_id: Marker identifier
            new_content: New content to insert between markers

        Returns:
            Tuple of (updated_content, was_updated)
            was_updated is False if markers weren't found
        """
        begin_marker, end_marker = self.get_marker_pattern(marker_id)
        regex = self._build_marker_regex(marker_id)

        if not regex.search(content):
            return content, False

        replacement = f"{begin_marker}\n{new_content}\n{end_marker}"
        updated_content = regex.sub(replacement, content)

        return updated_content, True

    def update_multiple_sections(self, content: str, updates: dict[str, str]) -> tuple[str, dict[str, bool]]:
        """
        Update multiple sections in content.

        Args:
            content: Original Markdown content
            updates: Dictionary mapping marker_id to new_content

        Returns:
            Tuple of (updated_content, results_dict)
            results_dict maps marker_id to whether it was updated
        """
        results = {}
        current_content = content

        for marker_id, new_content in updates.items():
            current_content, was_updated = self.update_section(current_content, marker_id, new_content)
            results[marker_id] = was_updated

        return current_content, results

    def update_file(self, file_path: Path | str, marker_id: str, new_content: str) -> bool:
        """
        Update a file by replacing content between markers.

        Args:
            file_path: Path to the Markdown file
            marker_id: Marker identifier
            new_content: New content to insert

        Returns:
            True if update was successful, False if markers not found

        Raises:
            FileNotFoundError: If file doesn't exist
        """
        file_path = Path(file_path)

        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        original_content = file_path.read_text(encoding="utf-8")
        updated_content, was_updated = self.update_section(original_content, marker_id, new_content)

        if not was_updated:
            return False

        file_path.write_text(updated_content, encoding="utf-8")
        return True

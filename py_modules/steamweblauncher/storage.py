import json
import os
import tempfile
import time

READABLE_BY_EVERYONE = 0o644


def _move_aside_for_inspection(path: str) -> None:
    os.replace(path, f"{path}.corrupt-{int(time.time())}")


def read_json_or_none(path: str):
    try:
        with open(path, encoding="utf-8") as file:
            return json.load(file)
    except FileNotFoundError:
        return None
    except json.JSONDecodeError:
        _move_aside_for_inspection(path)
        return None


def write_json_atomic(path: str, data) -> None:
    write_text_atomic(path, json.dumps(data, indent=2, ensure_ascii=False))


def write_text_atomic(path: str, text: str) -> None:
    directory = os.path.dirname(path)
    os.makedirs(directory, exist_ok=True)
    fd, temp_path = tempfile.mkstemp(dir=directory, prefix=".tmp-")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as file:
            file.write(text)
            file.flush()
            os.fsync(file.fileno())
        os.chmod(temp_path, READABLE_BY_EVERYONE)
        os.replace(temp_path, path)
    except BaseException:
        if os.path.exists(temp_path):
            os.unlink(temp_path)
        raise

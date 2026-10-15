import logging
import os

_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".sandbox")

DECKY_USER = os.environ.get("USER", "deck")
DECKY_USER_HOME = os.path.expanduser("~")
DECKY_PLUGIN_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DECKY_PLUGIN_SETTINGS_DIR = os.path.join(_ROOT, "settings")
DECKY_PLUGIN_RUNTIME_DIR = os.path.join(_ROOT, "data")
DECKY_PLUGIN_LOG_DIR = os.path.join(_ROOT, "logs")

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger("steamweblauncher")

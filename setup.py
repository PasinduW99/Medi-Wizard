from setuptools import setup, find_packages
import sys
from cx_Freeze import setup, Executable

# Dependencies
build_exe_options = {
    "packages": ["tkinter", "PIL", "customtkinter"],
    "include_files": [],
    "excludes": []
}

# Base for Windows systems
base = None
if sys.platform == "win32":
    base = "Win32GUI"

setup(
    name="MediWizard",
    version="1.0.0",
    description="AI Health Assistant",
    author="Bolt AI",
    options={"build_exe": build_exe_options},
    executables=[Executable(
        "medi_wizard.py", 
        base=base,
        target_name="MediWizard.exe",
        icon=None, # Add icon path if available
        shortcut_name="Medi Wizard",
        shortcut_dir="DesktopFolder"
    )]
)
#!/usr/bin/env python3
"""ExcbonCP — Admin User Creation Script.

Creates the initial owner account for the ExcbonCP central engineering server.
The first user in the system is automatically assigned the 'owner' role.

Usage:
    python3 scripts/create-admin.py [--username USER] [--password PASS] [--display-name NAME]
"""

import argparse
import asyncio
import getpass
import re
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))


def validate_password(password: str) -> list[str]:
    """Validate password strength. Returns list of error messages (empty = valid)."""
    errors: list[str] = []

    if len(password) < 12:
        errors.append("Password must be at least 12 characters long")
    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter")
    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter")
    if not re.search(r"\d", password):
        errors.append("Password must contain at least one digit")

    return errors


async def async_main(args: argparse.Namespace) -> None:
    """Async main routine."""
    # Import server modules
    try:
        from server.auth.models import UserCreate
        from server.auth.service import create_user, get_user_by_username
        from server.database import close_db, get_db, init_db
    except ImportError as e:
        print(f"[ERROR] Could not import server modules: {e}")
        print("        Make sure dependencies are installed: pip install -r server/requirements.txt")
        sys.exit(1)

    await init_db()
    db = await get_db()

    try:
        username = args.username
        if not username:
            while True:
                username = input("Username: ").strip()
                if not username:
                    print("  Username cannot be empty.")
                    continue
                if len(username) < 3:
                    print("  Username must be at least 3 characters.")
                    continue
                if not re.match(r"^[a-zA-Z0-9_-]+$", username):
                    print("  Username can only contain letters, numbers, hyphens, and underscores.")
                    continue

                existing = await get_user_by_username(db, username)
                if existing:
                    print(f"  User '{username}' already exists. Choose a different username.")
                    continue
                break
        else:
            existing = await get_user_by_username(db, username)
            if existing:
                print(f"[ERROR] User '{username}' already exists.")
                sys.exit(1)

        display_name = args.display_name or (input("Display name (optional): ").strip() if not args.username else "")
        display_name = display_name or username

        password = args.password
        if not password:
            while True:
                password = getpass.getpass("Password (min 12 chars, mixed case + digits): ")
                errors = validate_password(password)
                if errors:
                    for err in errors:
                        print(f"  ✗ {err}")
                    continue

                password_confirm = getpass.getpass("Confirm password: ")
                if password != password_confirm:
                    print("  ✗ Passwords do not match.")
                    continue
                break
        else:
            errors = validate_password(password)
            if errors:
                for err in errors:
                    print(f"[ERROR] {err}")
                sys.exit(1)

        user_in = UserCreate(
            username=username,
            password=password,
            display_name=display_name,
        )

        user = await create_user(db, user_in)

        print()
        print("╔══════════════════════════════════════════════════╗")
        print("║         Admin Account Created! ✅                ║")
        print("╚══════════════════════════════════════════════════╝")
        print()
        print(f"  Username:     {user.username}")
        print(f"  Display Name: {user.display_name}")
        print(f"  Role:         {user.role}")
        print(f"  User ID:      {user.id}")
        print()
        print("  You can now log in at: http://localhost:8000/docs")
        print()

    finally:
        await close_db()


def main() -> None:
    parser = argparse.ArgumentParser(description="Create initial owner account for ExcbonCP")
    parser.add_argument("--username", "-u", help="Username for owner account")
    parser.add_argument("--password", "-p", help="Password for owner account")
    parser.add_argument("--display-name", "-d", help="Display name for owner account")
    args = parser.parse_args()

    print()
    print("╔══════════════════════════════════════════════════╗")
    print("║      ExcbonCP — Create Admin Account             ║")
    print("╚══════════════════════════════════════════════════╝")
    print()

    asyncio.run(async_main(args))


if __name__ == "__main__":
    main()

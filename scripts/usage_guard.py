#!/usr/bin/env python3
"""Manual checkpoint reminder. This does not query any provider's quota."""

import argparse
import json
import math
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATE = ROOT / ".local" / "usage-session.json"
SERVICES = ("codex", "antigravity", "other")


def percentage(value):
    result = float(value)
    if not math.isfinite(result) or not 0 <= result <= 100:
        raise argparse.ArgumentTypeError("remaining must be between 0 and 100")
    return result


def minutes(value):
    result = float(value)
    if not math.isfinite(result) or result < 0:
        raise argparse.ArgumentTypeError("reset minutes must be non-negative")
    return result


def read_state():
    if not STATE.exists():
        return {}
    try:
        state = json.loads(STATE.read_text(encoding="utf-8"))
        if not isinstance(state, dict):
            raise ValueError("state is not an object")
        return state
    except (OSError, ValueError) as exc:
        raise RuntimeError(f"Cannot read {STATE}: {exc}") from exc


def main():
    parser = argparse.ArgumentParser(
        description="Manual reminder only; does not read real provider usage."
    )
    commands = parser.add_subparsers(dest="command", required=True)
    start = commands.add_parser("start", help="Start a local elapsed-time reminder")
    start.add_argument("--service", choices=SERVICES, default="codex")
    check = commands.add_parser("check", help="Check manually supplied quota and elapsed time")
    check.add_argument("--service", choices=SERVICES, default="codex")
    check.add_argument("--remaining", type=percentage, help="Percent remaining shown by provider")
    check.add_argument("--reset-minutes", type=minutes, help="Minutes until provider reset")
    args = parser.parse_args()

    try:
        state = read_state()
        now = datetime.now(timezone.utc)
        if args.command == "start":
            STATE.parent.mkdir(parents=True, exist_ok=True)
            state[args.service] = now.isoformat()
            STATE.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")
            print(f"Started local reminder for {args.service} at {now.isoformat()}.")
            print("This is not the provider's quota window or reset time.")
            return 0

        reasons = []
        stamp = state.get(args.service)
        if stamp:
            try:
                started = datetime.fromisoformat(stamp)
                if started.tzinfo is None:
                    raise ValueError("timestamp has no timezone")
                elapsed = (now - started.astimezone(timezone.utc)).total_seconds() / 60
                if elapsed < 0:
                    raise ValueError("timestamp is in the future")
                print(f"Local elapsed time: {elapsed:.0f} minutes; not a quota measurement.")
                if elapsed >= 240:
                    reasons.append("4 hours elapsed since local reminder started")
            except (TypeError, ValueError) as exc:
                raise RuntimeError(f"Invalid local start time: {exc}") from exc
        else:
            print(f"No local reminder started for {args.service}.")

        if args.remaining is None:
            print("Actual remaining quota UNKNOWN; check the provider dashboard or Codex /status.")
        else:
            print(f"Manually reported quota remaining: {args.remaining:g}%.")
            if args.remaining <= 20:
                reasons.append("reported quota remaining is 20% or less")
        if args.reset_minutes is not None:
            print(f"Manually reported time to reset: {args.reset_minutes:g} minutes.")
            if args.reset_minutes <= 60:
                reasons.append("reported reset is within 60 minutes")

        if reasons:
            print("REVIEW / HANDOFF NOW: " + "; ".join(reasons) + ".")
            print("Compare plan and Git; verify work; update TIEN_DO.md and BAN_GIAO.md.")
            return 2
        if args.remaining is None:
            print("UNKNOWN: work in small increments and checkpoint frequently.")
            return 3
        print("No reminder threshold reached. Recheck after each small task.")
        return 0
    except (OSError, RuntimeError) as exc:
        print(f"ERROR: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

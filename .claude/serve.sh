#!/bin/bash
PORT=${PORT:-8085}
exec python3 -m http.server "$PORT" --directory "/Users/raufenc/Library/Mobile Documents/com~apple~CloudDocs/Muhtelif/Claude/ilmihal-site"

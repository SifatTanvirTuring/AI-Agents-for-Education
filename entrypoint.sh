#!/bin/sh

# This is a feature request on a working project.
# The initial state is healthy, so the build command should succeed.

echo "Running build to verify initial project state..."

npm run build

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Build successful. The initial project state is healthy."
else
  echo "❌ Build failed with exit code $EXIT_CODE. The initial project state is broken."
fi

exit $EXIT_CODE

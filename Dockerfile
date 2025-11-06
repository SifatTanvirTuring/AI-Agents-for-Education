FROM node:22

RUN apt-get update && apt-get install -y git python3 python3-pip python3-venv

WORKDIR /app

RUN REPO_URL="https://github.com/SifatTanvirTuring/AI-Agents-for-Education" \
    && git clone "$REPO_URL" \
    && cd "$(basename "$REPO_URL" .git)" \
    && COMMIT_HASH="$(git rev-list -n 1 --before='2025-10-25' main)" \
    && git checkout "$COMMIT_HASH"

RUN cp -r /app/AI-Agents-for-Education/deliverable/env/* /app/ && \
    cp /app/AI-Agents-for-Education/deliverable/verify/*.js /app/ 2>/dev/null || true


RUN python3 -m venv /opt/venv

ENV PATH="/opt/venv/bin:$PATH"

RUN pip install your dependencies

RUN npm install
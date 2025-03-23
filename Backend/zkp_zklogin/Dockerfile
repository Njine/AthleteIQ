# Use a minimal base image (Alpine for small size, Debian for compatibility)
FROM debian:bookworm-slim

# Set working directory
WORKDIR /app

RUN DEBIAN_FRONTEND=noninteractive apt update && apt install -y libopenmpi-dev tzdata

# Copy the precompiled Rust binary
COPY zklogin /app/zklogin

# Ensure the binary has execution permissions
RUN chmod +x /app/zklogin
EXPOSE 8080
# Set default command to run the Rust app
CMD ["/app/zklogin"]

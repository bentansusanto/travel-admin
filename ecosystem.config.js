module.exports = {
  apps: [
    {
      name: "travel-admin",
      script: "./.next/standalone/server.js",
      cwd: "/www/wwwroot/travel-admin",

      // Cluster mode for load balancing
      instances: 2, // 2 instances (adjust based on traffic)
      exec_mode: "cluster",

      // Environment variables
      env: {
        NODE_ENV: "production",
        PORT: 3006,
        HOSTNAME: "0.0.0.0"
      },

      // Memory management (CRITICAL for Next.js!)
      max_memory_restart: "512M", // Auto-restart if memory exceeds 512MB
      node_args: "--max-old-space-size=480", // V8 heap limit (slightly lower than max_memory_restart)

      // Auto-restart configuration
      autorestart: true,
      watch: false, // Don't watch files in production
      max_restarts: 10, // Max restart attempts
      min_uptime: "10s", // Min uptime before considered stable
      restart_delay: 4000, // Delay between restarts

      // Logging
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // Advanced settings
      kill_timeout: 5000, // Time to wait before force kill
      listen_timeout: 3000, // Time to wait for app to listen
      shutdown_with_message: true,

      // Environment file
      env_file: ".env",

      // Cron restart (optional - restart daily at 3 AM)
      cron_restart: "0 3 * * *",

      // Source map support
      source_map_support: true,

      // Instance variables
      instance_var: "INSTANCE_ID",

      // Next.js specific
      wait_ready: true,
      listen_timeout: 10000 // Next.js needs more time to start
    }
  ]
};

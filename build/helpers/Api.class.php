<?php

/**
 * Class Api
 * Represents an API handler, capable of making HTTP requests to a specified API endpoint.
 */
class Api {
    // Slug for the plugin, useful for logging and other plugin-specific functionality
    protected static $plugin_slug = 'vml-fixtures';

    // Base URL of the API, useful for making requests to various endpoints of the API
    protected const API_BASE_URL = "https://api.graphicsystems.com/";

    // Specific URL for API access, derived from the base URL
    protected const API_URL = self::API_BASE_URL . "api.aspx/";

    /**
     * Makes an API call to a specified function of the API with given parameters.
     *
     * @param string $function The API function to call.
     * @param array $params The parameters to pass to the API function.
     * @param bool $debug Whether to enable debug logging.
     * @param int $timeout The timeout for the API call.
     * @return array The data returned from the API call.
     */
    public function make_api_call(string $function, array $params = [], bool $debug = false, int $timeout = 10): array {
        $url = self::API_URL . $function;
        $body = !empty($params) ? json_encode($params) : null;

        if ($debug) {
            $this->log_msg("make_api_call($function): ");
            $this->log_msg(print_r($params, true));
            $this->log_msg($body);
        }

        $response = wp_remote_post($url, [
            'method'      => 'POST',
            'timeout'     => $timeout,
            'redirection' => 5,
            'httpversion' => 1,
            'blocking'    => true,
            'headers'     => [
                'Accept'       => 'application/json',
                'Content-Type' => 'application/json',
            ],
            'body'        => $body,
            'cookies'     => []
        ]);

        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            $this->log_msg("Error returned from make_api_call($function, timeout=$timeout): $error_message");
            return [];  // Return empty array in case of error
        }

        $response_code = wp_remote_retrieve_response_code($response);
        if ($response_code !== 200) {
            $this->log_msg("HTTP error code $response_code returned from make_api_call($function, timeout=$timeout)");
            return [];  // Return empty array in case of HTTP error
        }

        $data = json_decode(json_decode($response['body'])->d, true);  // True forces it to an Associative Array

        if ($debug) {
            $this->log_msg("make_api_call Response: " . json_encode($data));
        }

        return $data;  // This will be an array
    }

    /**
     * Logs a message to a log file.
     *
     * @param string $msg The message to log.
     */
    public function log_msg(string $msg): void {
        $msg = current_time("Y-m-d H:i:s") . " " . $msg;  // Using current_time gives us WordPress configured date/timezone
        $dir = plugin_dir_path(__FILE__) . "../log/";

        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);  // The third parameter "true" allows the creation of nested directories specified in the pathname
        }

        file_put_contents($dir . self::$plugin_slug . "_" . current_time("Y-m-d") . ".log", $msg . "\n", FILE_APPEND);
    }
}

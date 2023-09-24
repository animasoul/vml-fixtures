<?php

require_once 'classes/Shelves.class.php';

$jsonString = <<<JSON
{
    "shelves": [
        {
            "items": [
                {"image": "SAI-Fall23-26.jpg"},
                {"image": "SAI-Fall23-26.jpg"},
                {"image": "SAI-Fall23-26.jpg"},
                {"image": "SAI-Fall23-26.jpg"},
                {"image": "SAI-Fall23-26.jpg"},
                {"image": "SAI-Fall23-31.jpg"}
            ]
        },
        {
            "items": [
                {"image": "SAI-Fall23-31.jpg"},
                {"image": "SAI-Fall23-31.jpg"},
                {"image": "SAI-Fall23-31.jpg"},
                {"image": "SAI-Fall23-31.jpg"},
                {"image": "SAI-Fall23-31.jpg"}
            ]
        },
        {
            "items": [
                {"image": "SAI-Fall23-36.jpg"},
                {"image": "SAI-Fall23-36.jpg"},
                {"image": "SAI-Fall23-36.jpg"},
                {"image": "SAI-Fall23-36.jpg"},
                {"image": "SAI-Fall23-36.jpg"}
            ]
        },
        {
            "custom": true,
            "items": [
                [
                    {"image": "SAI-Fall23-37_Thumb.jpg"}
                ],
                [
                    {"image": "SAI-Fall23-36.jpg"},
                    {"image": "SAI-Fall23-36.jpg"},
                    {"image": "SAI-Fall23-36.jpg"},
                    {"image": "SAI-Fall23-36.jpg"}
                ],
                [
                    {"image": "SAI-Fall23-89_Thumb.jpg"}
                ],
                [
                    {"image": "SAI-Fall23-26.jpg"}
                ],
                [
                    {"image": "SAI-Fall23-36.jpg"}
                ]
            ]
        }
    ]
}
JSON;

$config = json_decode($jsonString, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    die('Error decoding JSON: ' . json_last_error_msg());
}

$shelves = new Shelves($config, $baseImageUrl);
echo $shelves->generate();



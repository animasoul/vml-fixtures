<?php

require_once 'classes/Shelves.class.php';

require_once 'classes/ShelvesMapper.class.php';

// call the API to get the fixture data
require_once 'classes/Api.class.php';

// Instantiate the Api class
$getProducts = new Api();

$params = array(
	'storeRoot' => $data['customer'],
	'storeCode' => $data['store'],
	'promotion' => $data['promotion'],
  );
$apiData = $getProducts->make_api_call('GetSephoraProducts', $params, true, 30);


$shelvesData = <<<JSON
{
    "shelves": [
        {
            "Shelf": 1,
            "items": [
                {
                    "Horizontal": "Left",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-83.jpg"
                },
                {
                    "Horizontal": "Right",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-23.jpg"
                },
                {
                    "Horizontal": "Left",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-19.jpg"
                },
                {
                    "Horizontal": "Left",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-26.jpg"
                },
                {
                    "Horizontal": "Left",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-84.jpg"
                },
                {
                    "Horizontal": "Left",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-29.jpg"
                }
            ]
        },
        {
            "Shelf": 2,
            "items": [
                {
                    "Horizontal": "Left",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-31.jpg"
                },
                {
                    "Horizontal": "Left",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-31.jpg"
                },
                {
                    "Horizontal": "Left",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-31.jpg"
                },
                {
                    "Horizontal": "Left",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-31.jpg"
                },
                {
                    "Horizontal": "Left",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-31.jpg"
                }
            ]
        },
        {
            "Shelf": 3,
            "items": [
                {
                    "Horizontal": "Left",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-36.jpg"
                },
                {
                    "Horizontal": "Left",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-36.jpg"
                },
                {
                    "Horizontal": "Left",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-36.jpg"
                },
                {
                    "Horizontal": "Left",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-36.jpg"
                },
                {
                    "Horizontal": "Left",
                    "Vertical": "Middle",
                    "image": "SAI-Fall23-36.jpg"
                }
            ]
        },
        {
            "Shelf": 4,
            "custom": true,
            "items": [
                [
                    {
                        "Horizontal": "Left",
                        "Vertical": "Middle",
                        "image": "SAI-Fall23-37_Thumb.jpg"
                    }
                ],
                [
                    {
                        "Horizontal": "Left",
                        "Vertical": "Middle",
                        "image": "SAI-Fall23-36.jpg"
                    },
                    {
                        "Horizontal": "Left",
                        "Vertical": "Middle",
                        "image": "SAI-Fall23-36.jpg"
                    },
                    {
                        "Horizontal": "Left",
                        "Vertical": "Middle",
                        "image": "SAI-Fall23-36.jpg"
                    },
                    {
                        "Horizontal": "Left",
                        "Vertical": "Middle",
                        "image": "SAI-Fall23-36.jpg"
                    }
                ],
                [
                    {
                        "Horizontal": "Left",
                        "Vertical": "Middle",
                        "image": "SAI-Fall23-89_Thumb.jpg"
                    }
                ],
                [
                    {
                        "Horizontal": "Left",
                        "Vertical": "Middle",
                        "image": "SAI-Fall23-26.jpg"
                    }
                ],
                [
                    {
                        "Horizontal": "Left",
                        "Vertical": "Middle",
                        "image": "SAI-Fall23-36.jpg"
                    }
                ]
            ]
        }
    ]
}
JSON;

//$config = json_decode($shelvesData, true);

$shelvesData = json_decode($shelvesData, true);
$shelvesMapper = new ShelvesMapper();
$updatedShelvesData = $shelvesMapper->mapDataToShelves($shelvesData, $apiData);
//var_dump(json_encode($updatedShelvesData, true));



if (json_last_error() !== JSON_ERROR_NONE) {
    die('Error decoding JSON: ' . json_last_error_msg());
}

$shelves = new Shelves($shelvesData, $baseImageUrl);
echo $shelves->generate();



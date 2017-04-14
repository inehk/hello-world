<?php

/*

*/

$apiKey = file_get_contents("my_api_key.txt");

$cityId = 524901;
$url = "http://api.openweathermap.org/data/2.5/forecast/city?id=$cityId&APPID=$apiKey";
echo $url."<br/>";
$json = file_get_contents($url);
var_dump($json);

echo "<hr/>";

$url2 = "http://api.openweathermap.org/data/2.5/weather?q=Lyon,FR&APPID=$apiKey";
echo $url2."<br/>";
$json2 = file_get_contents($url2);
var_dump($json2);

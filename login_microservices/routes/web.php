<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response(file_get_contents(public_path('frontend/index.html')))
        ->header('Content-Type', 'text/html');
});

// Ruta para servir archivos estáticos del frontend
Route::get('/{path}', function($path) {
    $fullPath = public_path('frontend/' . $path);
    if (file_exists($fullPath)) {
        $contentType = 'application/octet-stream';
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        
        $mimeTypes = [
            'html' => 'text/html',
            'css' => 'text/css',
            'js' => 'application/javascript',
            'json' => 'application/json',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif'
        ];
        
        if (isset($mimeTypes[$extension])) {
            $contentType = $mimeTypes[$extension];
        }
        
        return response(file_get_contents($fullPath))
            ->header('Content-Type', $contentType);
    }
    return response()->json(['error' => 'Not found'], 404);
})->where('path', '.*');

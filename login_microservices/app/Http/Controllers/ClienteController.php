<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class ClienteController extends Controller
{
    public function index()
    {
        return response()->json(Cliente::all());
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'nombre' => 'required|string|max:150',
                'telefono' => 'required|string|max:50',
                'correo' => 'required|email|max:100',
                'numero_licencia' => [
                    'required',
                    'string',
                    'max:50',
                    function ($attribute, $value, $fail) {
                        if (Cliente::where('numero_licencia', $value)->exists()) {
                            $fail('Ya existe un cliente registrado con este número de licencia.');
                        }
                    }
                ]
            ]);

            $cliente = Cliente::create($validatedData);
            return response()->json($cliente, 201);
        } catch (ValidationException $e) {
            Log::error('Error de validación en ClienteController@store: ' . $e->getMessage());
            return response()->json([
                'message' => 'Datos de entrada no válidos.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error en ClienteController@store: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al crear el cliente.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $cliente = Cliente::findOrFail($id);
            return response()->json($cliente);
        } catch (\Exception $e) {
            Log::error('Error en ClienteController@show: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener el cliente.',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $cliente = Cliente::findOrFail($id);
            
            $validatedData = $request->validate([
                'nombre' => 'string|max:150',
                'telefono' => 'string|max:50',
                'correo' => 'email|max:100',
                'numero_licencia' => [
                    'string',
                    'max:50',
                    function ($attribute, $value, $fail) use ($id) {
                        $existingCliente = Cliente::where('numero_licencia', $value)
                            ->where('id', '!=', $id)
                            ->first();
                        if ($existingCliente) {
                            $fail('Ya existe otro cliente registrado con este número de licencia.');
                        }
                    }
                ]
            ]);

            $cliente->update($validatedData);
            return response()->json($cliente);
        } catch (ValidationException $e) {
            Log::error('Error de validación en ClienteController@update: ' . $e->getMessage());
            return response()->json([
                'message' => 'Datos de entrada no válidos.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error en ClienteController@update: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar el cliente.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $cliente = Cliente::findOrFail($id);
            
            if ($cliente->reservas()->where('estado', 'activa')->exists()) {
                return response()->json([
                    'message' => 'No se puede eliminar el cliente porque tiene reservas activas.'
                ], 400);
            }
            
            $cliente->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Error en ClienteController@destroy: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al eliminar el cliente.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function historialReservas($id)
    {
        try {
            $cliente = Cliente::findOrFail($id);
            return response()->json($cliente->reservas()->with('vehiculo')->get());
        } catch (\Exception $e) {
            Log::error('Error en ClienteController@historialReservas: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener el historial de reservas.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 
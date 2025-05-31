<?php

namespace App\Http\Controllers;

use App\Models\Vehiculo;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log; // Para registrar errores
use Carbon\Carbon; // Necesario para after_or_equal:today si se usa

class VehiculoController extends Controller
{
    public function index()
    {
        return response()->json(Vehiculo::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'marca' => 'required|string|max:100',
            'modelo' => 'required|string|max:100',
            'anio' => 'required|date_format:Y',
            'categoria' => 'required|string|max:50',
            'estado' => 'required|in:disponible,alquilado,mantenimiento'
        ]);

        $vehiculo = Vehiculo::create($request->all());
        return response()->json($vehiculo, 201);
    }

    public function show($id)
    {
        $vehiculo = Vehiculo::findOrFail($id);
        return response()->json($vehiculo);
    }

    public function update(Request $request, $id)
    {
        $vehiculo = Vehiculo::findOrFail($id);
        
        $request->validate([
            'marca' => 'string|max:100',
            'modelo' => 'string|max:100',
            'anio' => 'date_format:Y',
            'categoria' => 'string|max:50',
            'estado' => 'in:disponible,alquilado,mantenimiento'
        ]);

        $vehiculo->update($request->all());
        return response()->json($vehiculo);
    }

    public function destroy($id)
    {
        $vehiculo = Vehiculo::findOrFail($id);
        $vehiculo->delete();
        return response()->json(null, 204);
    }

    public function disponibles()
    {
        $vehiculos = Vehiculo::where('estado', 'disponible')->get();
        return response()->json($vehiculos);
    }

    public function disponiblesEnRango(Request $request)
    {
        try {

            $today = Carbon::today();

            $validatedData = $request->validate([
                'fecha_inicio' => [
                    'required',
                    'date',
                    function ($attribute, $value, $fail) use ($today) {
                        $fechaInicio = Carbon::parse($value)->startOfDay();
                        if ($fechaInicio->lt($today)) {
                            $fail('La fecha de inicio debe ser hoy o una fecha futura.');
                        }
                    }
                ],
                'fecha_fin' => [
                    'required',
                    'date',
                    function ($attribute, $value, $fail) use ($request) {
                        $fechaInicio = Carbon::parse($request->fecha_inicio)->startOfDay();
                        $fechaFin = Carbon::parse($value)->startOfDay();
                        if ($fechaFin->lte($fechaInicio)) {
                            $fail('La fecha de fin debe ser posterior a la fecha de inicio.');
                        }
                    }
                ],
            ]);

            $fechaInicio = Carbon::parse($validatedData['fecha_inicio'])->startOfDay();
            $fechaFin = Carbon::parse($validatedData['fecha_fin'])->startOfDay();

            
            $vehiculos = Vehiculo::where('estado', '!=', 'mantenimiento')
                ->whereDoesntHave('reservas', function ($query) use ($fechaInicio, $fechaFin) {
                    $query->where('estado', 'activa')
                          ->where(function ($subQuery) use ($fechaInicio, $fechaFin) {
                              $subQuery->where('fecha_inicio', '<=', $fechaFin->format('Y-m-d'))
                                     ->where('fecha_fin', '>=', $fechaInicio->format('Y-m-d'));
                          });
                })
                ->get();

            return response()->json($vehiculos);

        } catch (ValidationException $e) {
            Log::error('Error de validación en disponiblesEnRango: ' . $e->getMessage(), ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Datos de entrada no válidos.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error en VehiculoController@disponiblesEnRango: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Error interno del servidor al buscar vehículos disponibles.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 
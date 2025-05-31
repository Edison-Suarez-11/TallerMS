<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Vehiculo;
use Illuminate\Http\Request;

class ReservaController extends Controller
{
    public function index()
    {
        return response()->json(Reserva::with(['cliente', 'vehiculo'])->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'vehiculo_id' => 'required|exists:vehiculos,id',
            'fecha_inicio' => 'required|date|after_or_equal:today',
            'fecha_fin' => 'required|date|after:fecha_inicio'
        ]);

        
        $vehiculo = Vehiculo::findOrFail($request->vehiculo_id);
        if ($vehiculo->estado !== 'disponible') {
            return response()->json(['error' => 'El vehículo no está disponible'], 400);
        }

      
        $reservasSolapadas = Reserva::where('vehiculo_id', $request->vehiculo_id)
            ->where('estado', 'activa')
            ->where(function($query) use ($request) {
                $query->whereBetween('fecha_inicio', [$request->fecha_inicio, $request->fecha_fin])
                    ->orWhereBetween('fecha_fin', [$request->fecha_inicio, $request->fecha_fin]);
            })->exists();

        if ($reservasSolapadas) {
            return response()->json(['error' => 'El vehículo ya está reservado para estas fechas'], 400);
        }

        $reserva = Reserva::create($request->all());
        $vehiculo->update(['estado' => 'alquilado']);

        return response()->json($reserva->load(['cliente', 'vehiculo']), 201);
    }

    public function show($id)
    {
        $reserva = Reserva::with(['cliente', 'vehiculo'])->findOrFail($id);
        return response()->json($reserva);
    }

    public function update(Request $request, $id)
    {
        $reserva = Reserva::findOrFail($id);
        
        $request->validate([
            'estado' => 'required|in:activa,completada,cancelada'
        ]);

        $reserva->update($request->all());

        if (in_array($request->estado, ['completada', 'cancelada'])) {
            $reserva->vehiculo->update(['estado' => 'disponible']);
        }

        return response()->json($reserva->load(['cliente', 'vehiculo']));
    }

    public function destroy($id)
    {
        $reserva = Reserva::findOrFail($id);
        
        if ($reserva->estado === 'activa') {
            $reserva->vehiculo->update(['estado' => 'disponible']);
        }
        
        $reserva->delete();
        return response()->json(null, 204);
    }

    public function historialPorVehiculo($vehiculoId)
    {
        Vehiculo::findOrFail($vehiculoId); 
        $reservas = Reserva::where('vehiculo_id', $vehiculoId)
                            ->with(['cliente:id,nombre,correo', 'vehiculo:id,marca,modelo,anio'])
                            ->orderBy('fecha_inicio', 'desc')
                            ->get();
        return response()->json($reservas);
    }

    public function historialPorCliente($clienteId)
    {
       

        $reservas = Reserva::where('cliente_id', $clienteId)
                            ->with(['vehiculo:id,marca,modelo,anio,categoria', 'cliente:id,nombre'])
                            ->orderBy('fecha_inicio', 'desc')
                            ->get();
        return response()->json($reservas);
    }
} 
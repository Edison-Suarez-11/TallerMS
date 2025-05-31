<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Vehiculo extends Model
{
    protected $table = 'vehiculos';
    
    protected $fillable = [
        'marca',
        'modelo',
        'anio',
        'categoria',
        'estado'
    ];

    
    protected $appends = ['fecha_proxima_disponibilidad'];

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    public function reservaActiva()
    {
        return $this->hasOne(Reserva::class)->where('estado', 'activa')->latest('fecha_inicio');
    }

    
    public function getFechaProximaDisponibilidadAttribute()
    {
        if ($this->estado === 'alquilado' && $this->reservaActiva) {
            return Carbon::parse($this->reservaActiva->fecha_fin)->format('d/m/Y');
        }
        return null;
    }
} 
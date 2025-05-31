<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'clientes';
    
    protected $fillable = [
        'nombre',
        'telefono',
        'correo',
        'numero_licencia'
    ];

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
} 
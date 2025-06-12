<?php
namespace App\Models\TalkStream;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Call extends Model
{
    protected $table = 'calls';

    protected $fillable = ['caller_id', 'callee_id', 'type', 'status', 'started_at', 'ended_at'];

    public function caller()
    {
        return $this->belongsTo(User::class, 'caller_id');
    }

    public function callee()
    {
        return $this->belongsTo(User::class, 'callee_id');
    }
}

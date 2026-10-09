<?php

namespace App\Enums;

enum SizeLabel: string
{
    case Size = 'Size';                 // clothing and one-size items
    case Capacity = 'Capacity';         // bottles
    case Resistance = 'Resistance';     // bands
}

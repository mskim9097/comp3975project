@props(['disabled' => false])

<input
    @disabled($disabled)
    {{ $attributes->merge([
        'class' => 'border-gray-300 bg-white text-gray-900 focus:border-primary focus:ring focus:ring-primary/30 rounded-md shadow-sm'
    ]) }}
>
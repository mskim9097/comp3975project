<x-guest-layout>
    <div class="mb-6 text-center">
        <h1 class="text-3xl font-bold text-primary">BCIT Lost &amp; Found</h1>
        <p class="mt-2 text-lg font-semibold text-gray-700">Admin Portal</p>
        <p class="mt-2 text-sm text-gray-500">
            Manage lost items, update item status, and view return logs.
        </p>
        <p class="mt-1 text-xs text-gray-400">Staff access only</p>
    </div>

    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}" class="space-y-4">
        @csrf

        <div>
            <x-input-label for="email" class="text-primaryLight" :value="__('Email')" />
            <x-text-input
                id="email"
                class="block mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring focus:ring-primary/30"
                type="email"
                name="email"
                :value="old('email')"
                required
                autofocus
                autocomplete="username"
            />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <div>
            <x-input-label for="password" class="text-primaryLight" :value="__('Password')" />
            <x-text-input
                id="password"
                class="block mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring focus:ring-primary/30"
                type="password"
                name="password"
                required
                autocomplete="current-password"
            />
            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>

        <div class="pt-2">
            <x-primary-button class="w-full justify-center bg-primary hover:bg-primaryDark focus:bg-primaryDark active:bg-primaryDark">
                {{ __('Log in') }}
            </x-primary-button>
        </div>
    </form>
</x-guest-layout>
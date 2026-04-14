<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Admin Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                <h1 class="text-2xl font-bold mb-2 text-gray-800">Welcome, Admin!</h1>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
                        <h3 class="font-semibold text-blue-800 text-lg">Items in Storage</h3>
                        <p class="text-4xl font-bold text-blue-600 mt-2">{{ $pendingCount }}</p>
                    </div>
                    
                    <div class="bg-green-50 p-6 rounded-lg border border-green-100 shadow-sm">
                        <h3 class="font-semibold text-green-800 text-lg">Returned Items</h3>
                        <p class="text-4xl font-bold text-green-600 mt-2">{{ $completedCount }}</p>
                    </div>
                    
                    <div class="bg-purple-50 p-6 rounded-lg border border-purple-100 shadow-sm">
                        <h3 class="font-semibold text-purple-800 text-lg">Pending AI Matches</h3>
                        <p class="text-4xl font-bold text-purple-600 mt-2">{{ $aiMatchingCount }}</p>
                    </div>
                </div>

            </div>
        </div>
    </div>
</x-app-layout>
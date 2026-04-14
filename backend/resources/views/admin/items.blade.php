<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Item Management') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                
                <h1 class="text-2xl font-bold mb-6 text-gray-800">Pending Approvals</h1>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white border border-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Item Name</th>
                                <th class="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Location</th>
                                <th class="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Found By</th>
                                <th class="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Status</th>
                                <th class="py-2 px-4 border-b text-center text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($items as $item)
                            <tr class="hover:bg-gray-50">
                                <td class="py-3 px-4 border-b text-sm text-gray-800">{{ $item->name }}</td>
                                <td class="py-3 px-4 border-b text-sm text-gray-600">{{ $item->location }}</td>
                                <td class="py-3 px-4 border-b text-sm text-gray-600">{{ $item->finder_id ?? 'Anonymous' }}</td>
                                <td class="py-3 px-4 border-b text-sm">
                                    <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">Pending</span>
                                </td>
                                <td class="py-3 px-4 border-b text-sm text-center space-x-2">
                                    
                                    <form action="{{ route('admin.items.approve', $item->id) }}" method="POST" class="inline-block">
                                        @csrf
                                        @method('PATCH')
                                        <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition">
                                            Approve
                                        </button>
                                    </form>

                                    <form action="{{ route('admin.items.reject', $item->id) }}" method="POST" class="inline-block">
                                        @csrf
                                        @method('PATCH')
                                        <button type="submit" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition">
                                            Reject
                                        </button>
                                    </form>

                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="5" class="py-8 text-center text-gray-500">
                                    No pending items found at the moment.
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    </div>
</x-app-layout>
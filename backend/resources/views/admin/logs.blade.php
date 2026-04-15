<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Return Logs') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                
                <h1 class="text-2xl font-bold mb-6 text-gray-800">Return Logs</h1>

                <form method="GET" class="mb-6 flex gap-3 flex-wrap">
    
                    <!-- Student ID -->
                    <input
                        type="text"
                        name="student_id"
                        value="{{ request('student_id') }}"
                        placeholder="Search by Student ID"
                        class="border rounded-lg px-3 py-2 text-sm"
                    >

                    <!-- Date -->
                    <input
                        type="date"
                        name="date"
                        value="{{ request('date') }}"
                        class="border rounded-lg px-3 py-2 text-sm"
                    >

                    <!-- Buttons -->
                    <button
                        type="submit"
                        class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        Filter
                    </button>

                    <a
                        href="{{ route('admin.logs') }}"
                        class="bg-gray-300 px-4 py-2 rounded-lg text-sm"
                    >
                        Reset
                    </a>

                </form>

                <div class="overflow-x-auto">
                    <table class="min-w-full border border-gray-200 rounded-lg">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Log ID</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item Name</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Finder Student ID</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Owner Student ID</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Returned At</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @forelse ($logs as $log)
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-3 text-sm text-gray-700">{{ $log->id }}</td>
                                    <td class="px-4 py-3 text-sm text-gray-700">{{ $log->item->name ?? 'N/A' }}</td>
                                    <td class="px-4 py-3 text-sm text-gray-700">{{ $log->finder->student_id ?? 'N/A' }}</td>
                                    <td class="px-4 py-3 text-sm text-gray-700">{{ $log->owner->student_id ?? 'N/A' }}</td>
                                    <td class="px-4 py-3 text-sm text-gray-700">
                                        {{ \Carbon\Carbon::parse($log->returned_at)->format('Y-m-d H:i') }}
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="px-4 py-6 text-center text-gray-500">
                                        No return logs found.
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
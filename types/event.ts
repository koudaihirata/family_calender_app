import { Label } from '@/types/label';

export type Event = {
    id: string;
    family_id: string;
    created_by: string;
    label_id: string | null;
    title: string;
    start_at: Date;
    end_at: Date;
    location_name: string | null;
    location_lat: number | null;
    location_lng: number | null;
    created_at: Date;
    updated_at: Date;
};

// APIから取得する際にlabelをJOINした形
export type EventWithLabel = Event & {
    label: Label | null;
};

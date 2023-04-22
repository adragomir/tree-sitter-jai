#import,dir "aaaa";

#load "ccc";

Str :: struct {
    a: int;
}

Uni :: union {
    struct_1_like: struct {
        a:int;
        b:string;
    };
}

Enu :: enum u32 {
  ENU1 :: 1;
  ENU2 :: 2;
}

My_Table :: #type Table(int, string, hash_func=my_hash_func);

some_func :: inline (a:struct{a:int;}) -> ((int, string) -> ()) {
  name(1, 2, 3);
}

build :: (a:[]string) {
    result, ok := func1(*a, 2, 3);
    // if result return;
    while f(a, 2, 3) < 10 {
        print("a");
    }
}




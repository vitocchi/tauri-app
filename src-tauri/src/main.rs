#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{
    sync::{mpsc, Arc, Mutex},
    thread::{self, JoinHandle},
};

fn _fib(n: usize) -> usize {
    match n {
        0 => panic!("zero is not a valid argument to fib()!"),
        1 | 2 => 1,
        3 => 2,
        _ => _fib(n - 1) + _fib(n - 2),
    }
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn fib(number: usize) -> usize {
    let f = _fib(number);
    println!("_fib({}), {}", number, f);
    f
}

fn fib_all_in_multi_thread(n: usize) -> Vec<usize> {
    let (tx, rx) = mpsc::channel();
    (1..n + 1)
        .rev()
        .map(|n| {
            let tx = tx.clone();
            thread::spawn(move || {
                let f = fib(n);
                tx.send((n, f)).unwrap();
            })
        })
        //.collect::<Vec<JoinHandle<usize>>>()
        //.into_iter()
        .map(|handle| handle.join().unwrap())
        .for_each(drop);
    let mut results = vec![0; n];
    drop(tx);
    for (n, f) in rx {
        results[n - 1] = f;
    }
    results
}

#[tauri::command]
fn fib_all(number: usize) -> Vec<usize> {
    fib_all_in_multi_thread(number)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![fib, fib_all])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
